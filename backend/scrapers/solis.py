from playwright.async_api import async_playwright
from datetime import datetime, timezone
import asyncio
import re

async def scrape_solis() -> dict:
    listings = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("https://solisislavista.com/all-floor-plans")

        # Wait for page to fully load (dynamic content)
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)  # Extra wait for dynamic content
        
        frames = page.frames
        target_frame = None
        for i, frame in enumerate(frames):
            try:
                frame_content = await frame.content()
                if "ll-floor-plan-card" in frame_content:
                    target_frame = frame
                    break
            except Exception as e:
                continue
        
        listing_elements = []
        if target_frame:
            listing_elements = await target_frame.query_selector_all(".ll-floor-plan-card")

        for element in listing_elements:
            try:
                listing = await extract_solis_listing_data(element)
                if listing:
                    listings.append(listing)
            except Exception as e:
                print(f"Error extracting listing: {e}")
                continue

        await browser.close()

    return {
        "listings": listings,
        "scraped_at": datetime.now(timezone.utc).isoformat() + "Z",
        "source": "solis"
    }


async def extract_solis_listing_data(element) -> dict | None:
    """Extract data from a single Solis listing element."""
    try:
        # Step 1: Get the three text spans (apartment type, bathrooms, sqft)
        text_spans = await element.query_selector_all("span.text-xs")
        apartment_type_text = await text_spans[0].inner_text() if len(text_spans) > 0 else ""
        bathrooms_text = await text_spans[1].inner_text() if len(text_spans) > 1 else ""
        sqft_text = await text_spans[2].inner_text() if len(text_spans) > 2 else ""

        # Step 2: Get address from h2
        address_el = await element.query_selector("h2")
        address = await address_el.inner_text() if address_el else "Unknown"

        # Step 3: Get price
        price_el = await element.query_selector("span.text-xl")
        price_text = await price_el.inner_text() if price_el else ""
        price_regex_match = re.search(r"[\d,]+", price_text)
        price = int(price_regex_match.group().replace(',', '')) if price_regex_match else None

        # Step 4: Get move-in date
        move_in_el = await element.query_selector("span.bg-ll-background-light")
        move_in_text = await move_in_el.inner_text() if move_in_el else ""
        move_in_date = move_in_text.strip() if move_in_text else "Unknown"

        # Step 5: Parse bedrooms and bathrooms
        bedrooms, bathrooms = None, 1.0
        if not re.search(r"studio", apartment_type_text, re.IGNORECASE):
            bedrooms_match = re.search(r"(\d+)", apartment_type_text, re.IGNORECASE)
            if bedrooms_match:
                bedrooms = int(bedrooms_match.group())
        
        if re.search(r"bath", bathrooms_text, re.IGNORECASE):
            bathrooms_match = re.search(r"(\d+(?:\.\d+)?)", bathrooms_text, re.IGNORECASE)
            if bathrooms_match:
                bathrooms = float(bathrooms_match.group())

        sqft_match = re.search(r"([\d,]+)", sqft_text, re.IGNORECASE)
        sqft = int(sqft_match.group().replace(',', '')) if sqft_match else None

        return {
            "address": address,
            "price": price,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "square_feet": sqft,
            "move_in_date": move_in_date,
            "category": "Residential",
            "source": "solis"
        }
    except Exception as e:
        print(f"Error parsing listing: {e}")
        return None
