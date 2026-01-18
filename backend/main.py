"""Main FastAPI application for Building Scanner."""

import os
import csv
import uuid
import asyncio
import logging
import zipfile
from io import StringIO, BytesIO
from pathlib import Path
from typing import Dict, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from models import (
    AddressInput,
    BuildingResult,
    JobStatus,
    UploadResponse,
    BuildingType,
    Confidence
)
from services import (
    ZipService, ImageService, SearchService, VisionService,
    CSVParserService, rate_limiter
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Directories - handle both local dev and Docker
BACKEND_DIR = Path(__file__).parent
# Check if we're in Docker (frontend/dist is sibling) or local dev (frontend/dist is in parent)
if (BACKEND_DIR / "frontend" / "dist").exists():
    # Docker: backend files are in /app, frontend/dist is at /app/frontend/dist
    BASE_DIR = BACKEND_DIR
else:
    # Local dev: backend is in /project/backend, frontend is in /project/frontend
    BASE_DIR = BACKEND_DIR.parent

OUTPUT_DIR = BASE_DIR / "output"
FRONTEND_DIR = BASE_DIR / "frontend" / "dist"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Job storage (in production, use Redis or database)
jobs: Dict[str, JobStatus] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Building Scanner API starting up...")
    yield
    logger.info("Building Scanner API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Building Scanner API",
    description="Analyze buildings to classify type and estimate window-to-wall ratio",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware for frontend (development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"  # Allow all for production (Railway)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for images
app.mount("/output", StaticFiles(directory=str(OUTPUT_DIR)), name="output")

# Initialize services
zip_service = ZipService()
image_service = ImageService(output_dir=str(OUTPUT_DIR))
search_service = SearchService()
vision_service = VisionService()
csv_parser_service = CSVParserService()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def parse_csv_fallback(content: str) -> List[AddressInput]:
    """Fallback CSV parser for well-formatted files."""
    addresses = []
    reader = csv.DictReader(StringIO(content))

    for row in reader:
        street_number = row.get("street_number") or row.get("Street Number") or row.get("number") or ""
        street_name = row.get("street_name") or row.get("Street Name") or row.get("street") or ""
        zip_code = row.get("zip_code") or row.get("Zip Code") or row.get("zip") or row.get("postal_code") or ""

        if street_number and street_name and zip_code:
            addresses.append(AddressInput(
                street_number=str(street_number).strip(),
                street_name=str(street_name).strip(),
                zip_code=str(zip_code).strip()
            ))

    return addresses


async def process_single_address(
    address: AddressInput,
    job_id: str
) -> BuildingResult:
    """Process a single address: fetch images, search, and analyze."""

    full_address = await zip_service.get_full_address(
        address.street_number,
        address.street_name,
        address.zip_code
    )

    logger.info(f"Processing: {full_address}")

    if job_id in jobs:
        jobs[job_id].current_address = full_address

    result = BuildingResult(
        street_number=address.street_number,
        street_name=address.street_name,
        zip_code=address.zip_code
    )

    state, county = await zip_service.lookup(address.zip_code)
    result.state = state
    result.county = county

    try:
        image_paths = await image_service.fetch_images(full_address, num_images=4)

        if not image_paths:
            result.error = "No streetview data available"
            result.building_type = BuildingType.MISC
            result.wwr_estimate = 0
            result.confidence = Confidence.LOW
            result.reasoning = "Could not fetch street view images for this address"
            return result

        result.images_folder = image_service.get_folder_name(full_address)

        search_results = await search_service.search_address(full_address)
        search_context = search_service.format_search_context(search_results)

        analysis = await vision_service.analyze_building(
            image_paths=image_paths,
            address=full_address,
            search_context=search_context
        )

        result.building_type = analysis.building_type
        result.wwr_estimate = analysis.wwr_estimate
        result.confidence = analysis.confidence
        result.reasoning = analysis.reasoning

    except Exception as e:
        logger.error(f"Error processing {full_address}: {e}")
        result.error = str(e)
        result.building_type = BuildingType.MISC
        result.wwr_estimate = 0
        result.confidence = Confidence.LOW
        result.reasoning = f"Processing error: {str(e)}"

    return result


async def process_job(job_id: str, addresses: List[AddressInput]):
    """Background task to process all addresses in a job."""
    job = jobs[job_id]
    job.status = "processing"
    job.results = []

    try:
        for i, address in enumerate(addresses):
            result = await process_single_address(address, job_id)
            job.results.append(result)
            job.processed_addresses = i + 1
            await asyncio.sleep(0.5)

        await save_results_csv(job_id, job.results)

        job.status = "completed"
        job.current_address = None
        logger.info(f"Job {job_id} completed successfully")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        job.status = "failed"
        job.error = str(e)


async def save_results_csv(job_id: str, results: List[BuildingResult]):
    """Save job results to CSV file."""
    csv_path = OUTPUT_DIR / f"results_{job_id}.csv"

    with open(csv_path, "w", newline="") as f:
        fieldnames = [
            "street_number", "street_name", "zip_code", "state", "county",
            "building_type", "wwr_estimate", "confidence", "reasoning",
            "images_folder", "error"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for result in results:
            writer.writerow({
                "street_number": result.street_number,
                "street_name": result.street_name,
                "zip_code": result.zip_code,
                "state": result.state or "",
                "county": result.county or "",
                "building_type": result.building_type.value if result.building_type else "",
                "wwr_estimate": result.wwr_estimate if result.wwr_estimate is not None else "",
                "confidence": result.confidence.value if result.confidence else "",
                "reasoning": result.reasoning or "",
                "images_folder": result.images_folder or "",
                "error": result.error or ""
            })

    logger.info(f"Saved results to {csv_path}")


# ============== API ENDPOINTS ==============

@app.get("/api")
async def api_root():
    """API root endpoint."""
    return {
        "name": "Building Scanner API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "POST /api/upload - Upload CSV file",
            "status": "GET /api/status/{job_id} - Check job status",
            "results": "GET /api/results/{job_id} - Download results CSV",
            "download_zip": "GET /api/download/{job_id}/zip - Download all results as ZIP"
        }
    }


@app.get("/api/health")
async def health_check():
    """Check if API keys are configured."""
    import os

    keys_status = {
        "OPENAI_API_KEY": bool(os.getenv("OPENAI_API_KEY")),
        "GOOGLE_MAPS_API_KEY": bool(os.getenv("GOOGLE_MAPS_API_KEY")),
        "GOOGLE_SEARCH_API_KEY": bool(os.getenv("GOOGLE_SEARCH_API_KEY")),
        "GOOGLE_SEARCH_ENGINE_ID": bool(os.getenv("GOOGLE_SEARCH_ENGINE_ID")),
    }

    # Show first/last 4 chars of each key for debugging (safe partial reveal)
    keys_preview = {}
    for key_name in keys_status:
        val = os.getenv(key_name, "")
        if val and len(val) > 8:
            keys_preview[key_name] = f"{val[:4]}...{val[-4:]}"
        elif val:
            keys_preview[key_name] = "****"
        else:
            keys_preview[key_name] = "NOT SET"

    all_configured = all(keys_status.values())

    return {
        "status": "healthy" if all_configured else "missing_keys",
        "keys_configured": keys_status,
        "keys_preview": keys_preview,
        "message": "All API keys configured" if all_configured else "Some API keys are missing!"
    }


@app.get("/api/test-apis")
async def test_apis():
    """Test each external API connection."""
    results = {}

    # Test Google Street View
    try:
        test_address = "350 5th Avenue, New York, NY 10118"
        paths = await image_service.fetch_images(test_address, num_images=1)
        results["google_streetview"] = {
            "status": "ok" if paths else "no_images",
            "message": f"Got {len(paths)} images" if paths else "No street view available"
        }
    except Exception as e:
        results["google_streetview"] = {"status": "error", "message": str(e)}

    # Test Google Custom Search
    try:
        search_results = await search_service.search_address("350 5th Avenue NYC")
        results["google_search"] = {
            "status": "ok" if search_results else "no_results",
            "message": f"Got {len(search_results)} results"
        }
    except Exception as e:
        results["google_search"] = {"status": "error", "message": str(e)}

    # Test OpenAI (simple completion, not vision)
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI()
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say 'API working' in 2 words"}],
            max_tokens=10
        )
        results["openai"] = {
            "status": "ok",
            "message": response.choices[0].message.content
        }
    except Exception as e:
        results["openai"] = {"status": "error", "message": str(e)}

    return results


@app.get("/api/rate-limit")
async def get_rate_limit(request: Request):
    """Check current rate limit status."""
    client_ip = get_client_ip(request)
    used, remaining = rate_limiter.get_usage(client_ip)
    reset_seconds = rate_limiter.get_reset_time(client_ip)

    return {
        "buildings_used": used,
        "buildings_remaining": remaining,
        "limit": rate_limiter.limit,
        "reset_in_seconds": reset_seconds
    }


@app.post("/api/upload", response_model=UploadResponse)
async def upload_csv(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload a CSV file with addresses to process."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    try:
        content_str = content.decode("utf-8")
    except UnicodeDecodeError:
        content_str = content.decode("latin-1")

    # Try LLM parser first, fallback to simple parser
    logger.info("Parsing CSV with LLM...")
    parsed = await csv_parser_service.parse_csv(content_str)
    addresses = [
        AddressInput(**addr) for addr in parsed.get("addresses", [])
    ]

    # Fallback if LLM parsing failed
    if not addresses:
        logger.info("LLM parsing returned no results, trying fallback parser...")
        addresses = parse_csv_fallback(content_str)

    if not addresses:
        raise HTTPException(
            status_code=400,
            detail="Could not parse addresses from CSV. Please ensure your file contains address information."
        )

    # Check rate limit
    client_ip = get_client_ip(request)
    allowed, message = rate_limiter.check_limit(client_ip, len(addresses))

    if not allowed:
        raise HTTPException(status_code=429, detail=message)

    # Record usage
    rate_limiter.record_usage(client_ip, len(addresses))

    # Create job
    job_id = str(uuid.uuid4())[:8]
    job = JobStatus(
        job_id=job_id,
        status="pending",
        total_addresses=len(addresses),
        processed_addresses=0
    )
    jobs[job_id] = job

    background_tasks.add_task(process_job, job_id, addresses)

    return UploadResponse(
        job_id=job_id,
        message=f"Processing {len(addresses)} addresses",
        total_addresses=len(addresses)
    )


@app.get("/api/status/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get the status of a processing job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]


@app.get("/api/results/{job_id}")
async def get_results(job_id: str):
    """Download the results CSV for a completed job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job.status}"
        )

    csv_path = OUTPUT_DIR / f"results_{job_id}.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Results file not found")

    return FileResponse(
        path=str(csv_path),
        media_type="text/csv",
        filename=f"building_scanner_results_{job_id}.csv"
    )


@app.get("/api/results/{job_id}/json")
async def get_results_json(job_id: str):
    """Get the results as JSON for a completed job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job.status not in ["completed", "processing"]:
        raise HTTPException(
            status_code=400,
            detail=f"Job not ready. Current status: {job.status}"
        )

    return {
        "job_id": job_id,
        "status": job.status,
        "total": job.total_addresses,
        "processed": job.processed_addresses,
        "results": [
            {
                "street_number": r.street_number,
                "street_name": r.street_name,
                "zip_code": r.zip_code,
                "state": r.state,
                "county": r.county,
                "building_type": r.building_type.value if r.building_type else None,
                "wwr_estimate": r.wwr_estimate,
                "confidence": r.confidence.value if r.confidence else None,
                "reasoning": r.reasoning,
                "images_folder": r.images_folder,
                "error": r.error
            }
            for r in (job.results or [])
        ]
    }


@app.get("/api/download/{job_id}/zip")
async def download_zip(job_id: str):
    """Download all results as a ZIP file with compressed images."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs[job_id]
    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed. Current status: {job.status}"
        )

    # Create ZIP in memory
    zip_buffer = BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add results CSV
        csv_path = OUTPUT_DIR / f"results_{job_id}.csv"
        if csv_path.exists():
            zf.write(csv_path, "results.csv")

        # Add compressed images for each result
        for result in (job.results or []):
            if result.images_folder:
                images = image_service.get_compressed_images(result.images_folder)
                for filename, image_bytes in images:
                    zf.writestr(f"images/{result.images_folder}/{filename}", image_bytes)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=building_scanner_{job_id}.zip"
        }
    )


@app.get("/api/jobs")
async def list_jobs():
    """List all jobs."""
    return {
        "jobs": [
            {
                "job_id": job.job_id,
                "status": job.status,
                "total": job.total_addresses,
                "processed": job.processed_addresses
            }
            for job in jobs.values()
        ]
    }


# ============== STATIC FILES (Production) ==============

# Serve frontend static files in production
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    @app.get("/")
    async def serve_frontend():
        """Serve the React frontend."""
        return FileResponse(str(FRONTEND_DIR / "index.html"))

    @app.get("/{path:path}")
    async def serve_frontend_routes(path: str):
        """Serve frontend for all other routes (SPA support)."""
        # Check if it's an API route
        if path.startswith("api/") or path.startswith("output/"):
            raise HTTPException(status_code=404, detail="Not found")

        # Check if file exists in dist
        file_path = FRONTEND_DIR / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))

        # Return index.html for SPA routing
        return FileResponse(str(FRONTEND_DIR / "index.html"))
else:
    @app.get("/")
    async def root():
        """Root endpoint when no frontend is built."""
        return {
            "name": "Building Scanner API",
            "message": "Frontend not built. Run 'npm run build' in frontend directory.",
            "api_docs": "/docs"
        }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
