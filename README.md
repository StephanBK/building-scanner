# Building Scanner

A web application that analyzes building addresses to classify them as residential, commercial, or misc, and estimates window-to-wall ratio (WWR) using street-level imagery and AI vision.

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- API Keys:
  - Google Maps API key (with Street View Static API enabled)
  - Google Custom Search API key (optional, for web search context)
  - OpenAI API key (for GPT-4o Vision)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd building_scanner/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Add your API keys to `.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_key_here
   GOOGLE_SEARCH_API_KEY=your_key_here  # Optional
   GOOGLE_SEARCH_ENGINE_ID=your_id_here  # Optional
   OPENAI_API_KEY=your_key_here
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd building_scanner/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Usage

1. Prepare a CSV file with building addresses in the format:
   ```csv
   street_number,street_name,zip_code
   350,5th Avenue,10118
   1600,Pennsylvania Avenue NW,20500
   ```

2. Upload the CSV file through the web interface

3. Wait for the analysis to complete

4. View results and download the output CSV

## API Endpoints

- `POST /upload` - Upload CSV file for processing
- `GET /status/{job_id}` - Check job status
- `GET /results/{job_id}` - Download results CSV
- `GET /results/{job_id}/json` - Get results as JSON
- `GET /images/{folder}/{filename}` - View street view images

## Output

Results include:
- Building classification (residential, commercial, misc)
- Window-to-wall ratio estimate (0-100%)
- Confidence level (high, medium, low)
- Reasoning for the classification
- Street view images saved to output folder

## Cost Estimate

Per 10 addresses (within free tiers):
- Google Street View: ~50 calls ($0, free tier)
- Google Custom Search: ~40 calls ($0, 100 free/day)
- OpenAI GPT-4o Vision: ~10 calls (~$0.50-1.00)

Total: ~$1.00 per 10 addresses
