"""
Scraper for Wolfe & Associates (rlwa.com) - Isla Vista only
"""
from playwright.async_api import async_playwright
from datetime import datetime
import asyncio
import re

LISTING_URLS = [
    "https://www.rlwa.com/isla-vista-listings",
]

async def scrape_wolfe() -> dict:
    listings = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        for url in LISTING_URLS:
            await page.goto(url, timeout=60000)
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(3)
            
            listing_elements = await page.query_selector_all(".listing-item, .js-listing-card, [data-listingid]")
            
            for element in listing_elements:
                try:
                    listing = await extract_listing_data(element)
                    if listing:
                        listings.append(listing)
                except:
                    continue
        
        await browser.close()
    
    return {
        "listings": listings,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "source": "wolfe"
    }

async def extract_listing_data(element) -> dict | None:
    try:
        # Listing link
        link_el = await element.query_selector("a[href*='/listings/detail/']")
        listing_link = None
        if link_el:
            href = await link_el.get_attribute("href")
            listing_link = f"https://www.rlwa.com{href}" if href.startswith("/") else href
        
        # Address - in h2.address
        address_el = await element.query_selector("h2.address")
        address = (await address_el.inner_text()).strip() if address_el else None
        
        # Rent price - in h3.rent
        price_el = await element.query_selector("h3.rent")
        rent_price = None
        if price_el:
            price_text = await price_el.inner_text()
            # Extract just the number, skip "RENT" text
            price_match = re.search(r'\$?\s*(\d{1,3}(?:,\d{3})*)', price_text)
            rent_price = int(price_match.group(1).replace(',', '')) if price_match else None
        
        # Bedrooms - in amenities div
        beds_el = await element.query_selector(".amenities")
        bedrooms = None
        if beds_el:
            beds_text = await beds_el.inner_text()
            if re.search(r'studio', beds_text, re.IGNORECASE):
                bedrooms = 0
            else:
                # Look for "X bed" or "X bedroom" pattern
                beds_match = re.search(r'(\d+)\s*(?:bed|bedroom)', beds_text, re.IGNORECASE)
                bedrooms = int(beds_match.group(1)) if beds_match else None
        
        # Bathrooms - in amenities div
        baths_el = await element.query_selector(".amenities")
        bathrooms = None
        if baths_el:
            baths_text = await baths_el.inner_text()
            # Look for "X bath" or "X bathroom" pattern
            baths_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:bath|bathroom)', baths_text, re.IGNORECASE)
            bathrooms = float(baths_match.group(1)) if baths_match else None
        
        # Date available - in div.available
        date_el = await element.query_selector("div.available")
        date_available = (await date_el.inner_text()).strip() if date_el else None
        
        # Application link - in "Apply Now" button
        app_link_el = await element.query_selector("a.apm-apply-now")
        application_link = None
        if app_link_el:
            app_href = await app_link_el.get_attribute("href")
            if app_href:
                application_link = app_href if app_href.startswith("http") else f"https://www.rlwa.com{app_href}"
        
        # Fallback to forms page if no apply button found
        if not application_link:
            application_link = "https://www.rlwa.com/forms"
        
        # Utilities & amenities - in div.amenities and div.tagline
        amenities = []
        
        amenity_el = await element.query_selector(".amenities")
        if amenity_el:
            amenity_text = (await amenity_el.inner_text()).strip()
            if amenity_text:
                amenities.append(amenity_text)
        
        tagline_el = await element.query_selector(".tagline")
        if tagline_el:
            tagline_text = (await tagline_el.inner_text()).strip()
            if tagline_text:
                amenities.append(tagline_text)
        
        return {
            "listing_link": listing_link,
            "address": address,
            "price": rent_price,  # Frontend expects "price"
            "rent_price": rent_price,  # Keep for compatibility
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "date_available": date_available,
            "application_link": application_link,
            "contact_info": {
                "phone": "(805) 964-6770",
                "email": "mail@rlwa.com",
                "address": "173 Chapel Street, Santa Barbara, CA 93111"
            },
            "utilities_amenities": amenities if amenities else None,
            "category": "Residential",  # Default category
            "source": "wolfe"
        }
    except:
        return None