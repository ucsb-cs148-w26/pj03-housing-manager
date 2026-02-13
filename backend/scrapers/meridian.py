"""
Scraper for Meridian Group Real Estate (meridiangrouprem.com)
"""
from playwright.async_api import async_playwright
from datetime import datetime
import asyncio
import re

async def scrape_meridian() -> dict:
    """
    Scrape rental listings from Meridian Group Real Estate.
    Returns a dict with listings array and timestamp.
    """
    listings = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("https://meridiangrouprem.com/available-rentals/")
        
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        
        listing_elements = await page.query_selector_all(".prop-list")
        
        for element in listing_elements:
            try:
                listing = await extract_listing_data(element)
                if listing:
                    listings.append(listing)
            except Exception as e:
                print(f"Error extracting listing: {e}")
                continue
        
        await browser.close()
    
    return {
        "listings": listings,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "source": "meridian"
    }

async def extract_listing_data(element) -> dict | None:
    """Extract data from a single listing element."""
    try:
        link_el = await element.query_selector("a[href]")
        listing_link = None
        if link_el:
            href = await link_el.get_attribute("href")
            if href:
                listing_link = href if href.startswith("http") else f"https://meridiangrouprem.com{href}"
        
        address_el = await element.query_selector(".prop-details h3")
        address = await address_el.inner_text() if address_el else "Unknown"
        
        location_el = await element.query_selector(".prop-details > p")
        location = await location_el.inner_text() if location_el else ""
        
        full_address = f"{address.strip()}, {location.strip()}" if location else address.strip()
        
        price_el = await element.query_selector(".two-item-wrap p:first-child")
        price_text = await price_el.inner_text() if price_el else ""
        price_match = re.search(r'[\d,]+', price_text)
        price = int(price_match.group().replace(',', '')) if price_match else None
        
        beds_baths_el = await element.query_selector(".two-item-wrap p:last-child")
        beds_baths_text = await beds_baths_el.inner_text() if beds_baths_el else ""
        
        bedrooms = None
        if re.search(r'studio', beds_baths_text, re.IGNORECASE):
            bedrooms = 0
        else:
            beds_match = re.search(r'(\d+)\s*(?:bedroom|bed|br)', beds_baths_text, re.IGNORECASE)
            if beds_match:
                bedrooms = int(beds_match.group(1))
        
        bathrooms = None
        baths_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:bathroom|bath|ba)', beds_baths_text, re.IGNORECASE)
        if baths_match:
            bathrooms = float(baths_match.group(1))
        
        category = "Residential"
        if re.search(r'office|commercial', beds_baths_text, re.IGNORECASE):
            category = "Commercial"
        elif re.search(r'storage', beds_baths_text, re.IGNORECASE):
            category = "Storage"
        
        return {
            "listing_link": listing_link,
            "address": full_address,
            "price": price,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "category": category,
            "source": "meridian"
        }
    except Exception as e:
        print(f"Error parsing listing: {e}")
        return None