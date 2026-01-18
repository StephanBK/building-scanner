# Building Scanner - Deployment Plan

## Overview
Deploy the Building Scanner app to Railway with the following enhancements:
- Smart CSV parsing using GPT-4o-mini (handles messy formats)
- Image compression & ZIP download
- Rate limiting (100 buildings/hour)
- Single-service deployment (FastAPI serves React static files)

---

## Phase 1: Code Changes

### 1.1 Add LLM-based CSV Parser
**File:** `backend/services/csv_parser_service.py`

- Send raw CSV content to GPT-4o-mini
- Prompt asks LLM to identify address columns and normalize to our format
- Returns clean `street_number, street_name, zip_code` data
- Handles: different column names, single full-address column, extra columns
- Cost: ~$0.001 per CSV (very cheap)

### 1.2 Add Image Compression & ZIP Download
**Changes:**
- `backend/services/image_service.py` - compress to JPEG quality 65%
- `backend/main.py` - new endpoint `GET /download/{job_id}/zip`
- ZIP contains: `results.csv` + `images/` folders
- Frontend: add "Download All (ZIP)" button

### 1.3 Add Rate Limiting
**File:** `backend/services/rate_limiter.py`

- In-memory tracking by IP address
- Limit: 100 buildings per hour per IP
- Returns HTTP 429 with message when exceeded
- Resets hourly

### 1.4 Single-Service Setup
**Changes:**
- Build React to `frontend/dist/`
- FastAPI serves `dist/` as static files at root `/`
- API endpoints stay at `/upload`, `/status`, etc.
- Update `vite.config.js` for production build

### 1.5 Environment Variables
**Required in production:**
```
OPENAI_API_KEY=xxx
GOOGLE_MAPS_API_KEY=xxx
GOOGLE_SEARCH_API_KEY=xxx
GOOGLE_SEARCH_ENGINE_ID=xxx
```

---

## Phase 2: Git Setup

### 2.1 Prepare Repository
Files to ensure are gitignored:
- `.env` (API keys)
- `venv/`, `node_modules/`
- `output/` (generated files)
- `__pycache__/`

### 2.2 Create GitHub Repo
**You do this:**
1. Go to https://github.com/new
2. Repository name: `building-scanner`
3. Public: Yes
4. Don't initialize with README (we have code already)
5. Click "Create repository"

### 2.3 Push Code
**I'll run these commands:**
```bash
cd /Users/stephanketterer/building_scanner
git init
git add .
git commit -m "Initial commit: Building Scanner app"
git branch -M main
git remote add origin https://github.com/StephanBK/building-scanner.git
git push -u origin main
```

---

## Phase 3: Railway Deployment

### 3.1 Install Railway CLI
```bash
npm install -g @railway/cli
```

### 3.2 Login to Railway
```bash
railway login
```
(Opens browser for authentication)

### 3.3 Create Railway Project
```bash
cd /Users/stephanketterer/building_scanner
railway init
```

### 3.4 Connect to GitHub
In Railway Dashboard (https://railway.app):
1. Go to your project
2. Settings > Connect GitHub repo
3. Select `StephanBK/building-scanner`

### 3.5 Set Environment Variables
In Railway Dashboard > Variables, add:
- `OPENAI_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`

### 3.6 Configure Build & Start
Railway needs these files:

**`railway.json`:**
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT"
  }
}
```

**`nixpacks.toml`:** (tells Railway how to build)
```toml
[phases.setup]
nixPkgs = ["python311", "nodejs_18"]

[phases.install]
cmds = [
  "cd frontend && npm install && npm run build",
  "cd backend && pip install -r requirements.txt"
]
```

### 3.7 Deploy
```bash
railway up
```

Or just push to GitHub - Railway auto-deploys on push.

---

## Final Result

**Your app will be live at:** `https://building-scanner-xxx.up.railway.app`

**Features:**
- Upload any messy CSV - LLM parses it
- See results with building types and WWR
- Download ZIP with compressed images + CSV
- Rate limited to 100 buildings/hour

---

## Estimated Costs

| Service | Cost |
|---------|------|
| Railway | ~$5-10/month (usage-based) |
| OpenAI (per 10 buildings) | ~$1.00 |
| OpenAI (CSV parsing) | ~$0.001 per file |
| Google APIs | Free tier covers it |

---

## Your Action Items

1. Create the GitHub repo at https://github.com/new (name: `building-scanner`, public)
2. Tell me when done
3. I'll implement the code changes and push
4. Install Railway CLI when I tell you
5. Follow Railway setup steps

Ready to proceed?
