from playwright.async_api import async_playwright
from datetime import datetime, timezone
import asyncio
import json
import re

async def scrape_solis() -> dict:
    listings = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate directly to the Entrata embed URL.
        # The listing data is server-side rendered as JSON in the page's data-page attribute,
        # so we just parse that instead of scraping the DOM.
        await page.goto(
            "https://embed.leaseleads.co/9e5b6e85-dc8f-438c-b76e-a669428600ec/floor-plans",
            referer="https://solisislavista.com/",
        )
        await page.wait_for_load_state("networkidle")

        html = await page.content()
        m = re.search(r'data-page="([^"]+)"', html)
        if m:
            raw = m.group(1).replace("&quot;", '"').replace("&amp;", "&")
            data = json.loads(raw)
            floor_plans = data.get("props", {}).get("floorPlans", [])
            for fp in floor_plans:
                listing = extract_solis_listing_data(fp)
                if listing:
                    listings.append(listing)

        await browser.close()

    return {
        "listings": listings,
        "scraped_at": datetime.now(timezone.utc).isoformat() + "Z",
        "source": "solis",
    }


def extract_solis_listing_data(fp: dict) -> dict | None:
    """Extract a listing from a single floor plan JSON object."""
    try:
        # bedrooms == 0 means studio
        bedrooms = fp.get("bedrooms", 0) or None

        # status is "Move In Aug 22nd, 2026" — strip the prefix for a clean date
        status = fp.get("status", "")
        move_in_date = status.removeprefix("Move In ").strip() or "Unknown"

        apply_link = fp.get("apply_link") or {}
        listing_url = apply_link.get("url")

        return {
            "address": fp.get("name", "Unknown"),
            "price": fp.get("price_min"),
            "bedrooms": bedrooms,
            "bathrooms": fp.get("bathrooms"),
            "square_feet": fp.get("size_min"),
            "move_in_date": move_in_date,
            "category": "Residential",
            "source": "solis",
            "link": listing_url,
        }
    except Exception as e:
        print(f"Error parsing floor plan: {e}")
        return None
