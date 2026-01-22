"""
Housing Manager Backend API
Provides endpoints for scraping rental listings from various sources.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from scrapers.meridian import scrape_meridian

from scrapers.playalife import scrape_playalife


app = FastAPI(
    title="Housing Manager API",
    description="API for scraping and aggregating rental listings",
    version="1.0.0"
)

# Enable CORS for frontend
# In production, set ALLOWED_ORIGINS env var to your Vercel URL
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Housing Manager API"}


@app.get("/scrape/meridian")
async def scrape_meridian_endpoint():
    """
    Scrape rental listings from Meridian Group Real Estate.
    Returns listings with price, bedrooms, bathrooms, address, and category.
    """
    try:
        result = await scrape_meridian()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@app.get("/scrape/playalife")
async def scrape_playalife_endpoint():
    try:
        result = await scrape_playalife()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.get("/scrapers")
async def list_scrapers():
    """List available scrapers."""
    return {
        "scrapers": [
            {
                "id": "meridian",
                "name": "Meridian Group Real Estate",
                "url": "https://meridiangrouprem.com/",
                "endpoint": "/scrape/meridian"
            },
            {
                "id": "playalife",
                "name": "PlayaLife IV",
                "url": "https://www.playalifeiv.com/",
                "endpoint": "/scrape/playalife"
            }
        ]
    }
