"""
Housing Manager Backend API
Provides endpoints for scraping rental listings from various sources.
"""
import asyncio
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from scrapers.meridian import scrape_meridian
from scrapers.solis import scrape_solis
from scrapers.Koto import scrape_koto
from scrapers.playalife import scrape_playalife
from scrapers.wolfe_scraper import scrape_wolfe

from database import init_db, get_all_listings, get_scrape_metadata
from scheduler import scrape_loop, run_all_scrapers_to_db

_scrape_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _scrape_task
    await init_db()
    _scrape_task = asyncio.create_task(scrape_loop())
    yield
    _scrape_task.cancel()
    try:
        await _scrape_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Housing Manager API",
    description="API for scraping and aggregating rental listings",
    version="1.0.0",
    lifespan=lifespan,
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


@app.get("/scrape/wolfe")
async def scrape_wolfe_endpoint():
    """
    Scrape rental listings from Wolfe & Associates (Isla Vista).
    Returns listings with price, bedrooms, bathrooms, address, availability, and contact info.
    """
    try:
        result = await scrape_wolfe()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.get("/scrape/solis")
async def scrape_solis_endpoint():
    """
    Scrape rental listings from Solis Isla Vista.
    Returns listings with price, bedrooms, bathrooms, address, square footage, and move-in date.
    """
    try:
        result = await scrape_solis()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.get("/scrape/all")
async def scrape_all_endpoint():
    """
    Scrape rental listings from all property management companies in parallel.
    Returns combined listings with source field on each. Failed scrapers are skipped.
    """
    scrapers = [
        ("meridian", scrape_meridian),
        ("playalife", scrape_playalife),
        ("koto", scrape_koto),
        ("solis", scrape_solis),
        ("wolfe", scrape_wolfe),
    ]

    async def run_one(name, fn):
        try:
            return await fn()
        except Exception as e:
            print(f"Scraper {name} failed: {e}")
            return {"listings": [], "scraped_at": None, "source": name}

    results = await asyncio.gather(*[run_one(name, fn) for name, fn in scrapers])
    all_listings = []
    latest_at = None
    for data in results:
        listings = data.get("listings") or []
        for listing in listings:
            if "source" not in listing:
                listing["source"] = data.get("source", "unknown")
            all_listings.append(listing)
        scraped_at = data.get("scraped_at")
        if scraped_at and (latest_at is None or scraped_at > latest_at):
            latest_at = scraped_at
    if latest_at is None:
        latest_at = datetime.now(timezone.utc).isoformat() + "Z"
    return {
        "listings": all_listings,
        "scraped_at": latest_at,
        "sources": [name for name, _ in scrapers],
    }


@app.get("/listings")
async def listings_endpoint():
    """Return all listings from the database (pre-scraped)."""
    try:
        listings = await get_all_listings()
        meta = await get_scrape_metadata()
        sources = list({l["source"] for l in listings})
        return {
            "listings": listings,
            "last_updated": meta["last_updated"],
            "total": meta["total_listings"],
            "sources": sources,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")


@app.post("/listings/refresh")
async def refresh_listings_endpoint():
    """Manually trigger a full re-scrape and update the database."""
    try:
        await run_all_scrapers_to_db()
        meta = await get_scrape_metadata()
        return {
            "status": "ok",
            "total": meta["total_listings"],
            "last_updated": meta["last_updated"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")


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
                "id": "solis",
                "name": "Solis Isla Vista",
                "url": "https://solisislavista.com/",
                "endpoint": "/scrape/solis"
            },
            {
                "id": "playalife",
                "name": "PlayaLife IV",
                "url": "https://www.playalifeiv.com/",
                "endpoint": "/scrape/playalife"
            },
            {
                "id": "koto",
                "name": "Koto Group",
                "url": "https://www.kotogroup.com/",
                "endpoint": "/scrape/koto"
            },
            {
                "id": "wolfe",
                "name": "Wolfe & Associates (Isla Vista)",
                "url": "https://www.rlwa.com/",
                "endpoint": "/scrape/wolfe"
            }
        ]
    }