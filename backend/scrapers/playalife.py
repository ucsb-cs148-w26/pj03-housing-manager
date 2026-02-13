"""
Scraper for PlayaLife IV (playalifeiv.com)
"""
from playwright.async_api import async_playwright
from datetime import datetime
import asyncio
import re

async def scrape_playalife() -> dict:
    listings = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("https://www.playalifeiv.com/vacancies")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        
        listing_elements = await page.query_selector_all(".listing-item")
        
        for element in listing_elements:
            try:
                listing = await extract_listing_data(element)
                if listing:
                    listings.append(listing)
            except Exception as e:
                print(f"Error extracting listing: {e}")
        
        await browser.close()
    
    return {
        "listings": listings,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "source": "playalife"
    }

async def extract_listing_data(element) -> dict | None:
    """Extract data from a single PlayaLife listing card."""
    try:
        address_el = await element.query_selector(".photo a[aria-label]")
        address = await address_el.get_attribute("aria-label") if address_el else None
        
        listing_link = None
        if address_el:
            href = await address_el.get_attribute("href")
            if href:
                listing_link = href if href.startswith("http") else f"https://www.playalifeiv.com{href}"
        
        rent_el = await element.query_selector("h3.rent")
        rent_text = await rent_el.inner_text() if rent_el else ""
        price_match = re.search(r'[\d,]+', rent_text)
        price = int(price_match.group().replace(",", "")) if price_match else None
        
        beds_el = await element.query_selector(".feature.beds")
        beds_text = await beds_el.inner_text() if beds_el else ""
        beds_match = re.search(r'\d+', beds_text)
        bedrooms = int(beds_match.group()) if beds_match else None
        
        baths_el = await element.query_selector(".feature.baths")
        baths_text = await baths_el.inner_text() if baths_el else ""
        baths_match = re.search(r'\d+(?:\.\d+)?', baths_text)
        bathrooms = float(baths_match.group()) if baths_match else None
        
        return {
            "listing_link": listing_link,
            "address": address,
            "price": price,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "category": "Residential",
            "source": "playalife"
        }
    except Exception as e:
        print(f"Error parsing listing: {e}")
        return None