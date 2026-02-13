"""
Background scheduler that scrapes all sources on an interval and stores results in the DB.
Scrapers run sequentially to avoid OOM from multiple Playwright browsers.
"""

import asyncio
import os
from datetime import datetime, timezone

from database import upsert_listings
from scrapers.meridian import scrape_meridian
from scrapers.solis import scrape_solis
from scrapers.Koto import scrape_koto
from scrapers.playalife import scrape_playalife
from scrapers.wolfe_scraper import scrape_wolfe

SCRAPE_INTERVAL_HOURS = float(os.getenv("SCRAPE_INTERVAL_HOURS", "12"))

SCRAPERS = [
    ("meridian", scrape_meridian),
    ("playalife", scrape_playalife),
    ("koto", scrape_koto),
    ("solis", scrape_solis),
    ("wolfe", scrape_wolfe),
]


async def run_all_scrapers_to_db():
    """Run each scraper sequentially and upsert results into the DB."""
    print(f"[scheduler] Starting scrape run at {datetime.now(timezone.utc).isoformat()}")
    for name, fn in SCRAPERS:
        try:
            print(f"[scheduler] Scraping {name}...")
            result = await fn()
            listings = result.get("listings") or []
            await upsert_listings(listings, name)
            print(f"[scheduler] {name}: upserted {len(listings)} listings")
        except Exception as e:
            print(f"[scheduler] {name} failed: {e}")
    print(f"[scheduler] Scrape run complete at {datetime.now(timezone.utc).isoformat()}")


async def scrape_loop():
    """Infinite loop: scrape all sources, then sleep for the configured interval."""
    while True:
        try:
            await run_all_scrapers_to_db()
        except Exception as e:
            print(f"[scheduler] Unexpected error in scrape loop: {e}")
        await asyncio.sleep(SCRAPE_INTERVAL_HOURS * 3600)
