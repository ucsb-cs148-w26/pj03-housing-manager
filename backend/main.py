"""
Housing Manager Backend API
Provides endpoints for scraping rental listings from various sources.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from scrapers.meridian import scrape_meridian
from scrapers.Koto import scrape_koto

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


@app.get("/scrape/koto")
async def scrape_koto_endpoint():
    """
    Scrape rental listings from Koto Group.
    Returns listings with price, bedrooms, bathrooms, address, and category.
    """
    try:
        result = await scrape_koto()
        # Always return the result - if it has an error field, frontend will display it
        return result
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        print(f"Exception in koto endpoint ({error_type}): {error_msg}")
        
        # Provide more helpful error messages
        if "Load failed" in error_msg or "net::ERR" in error_msg or "net::" in error_msg:
            user_msg = "The website failed to load. This could be due to network issues, the website being down, or blocking automated access."
        elif "timeout" in error_msg.lower():
            user_msg = "The request timed out. The website may be slow or not responding."
        else:
            user_msg = f"Scraping failed: {error_msg}"
        
        raise HTTPException(status_code=500, detail=user_msg)


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
                "id": "koto",
                "name": "Koto Group",
                "url": "https://www.kotogroup.com/",
                "endpoint": "/scrape/koto"
            }
        ]
    }
