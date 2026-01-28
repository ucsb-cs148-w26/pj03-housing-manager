"""
Scraper for the Koto Group (https://www.kotogroup.com)
"""
from playwright.async_api import async_playwright
from datetime import datetime
import asyncio
import re


async def scrape_koto() -> dict:
    """
    Scrape rental listings from Koto Group.
    Returns a dict with listings array and timestamp.
    """
    listings = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate directly to the vacancies page
        await page.goto("https://www.kotogroup.com/vacancies")
        
        # Wait for page to fully load (dynamic content)
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(3)  # Extra wait for dynamic content to load

        # Try to find listing elements - the page uses dynamic loading
        listing_elements = []
        
        # Try common listing container selectors
        selectors_to_try = [
            "[class*='property']",
            "[class*='listing']",
            "[class*='vacancy']",
            "[class*='unit']",
            "[class*='result']",
            ".property-card",
            ".listing-card",
            ".card",
            "article",
            "[data-property]",
            "[data-listing]",
            "div[class*='Property']",
            "div[class*='Listing']",
            "div[class*='Result']"
        ]
        
        for selector in selectors_to_try:
            elements = await page.query_selector_all(selector)
            if elements and len(elements) > 0:
                print(f"Found {len(elements)} elements with selector: {selector}")
                # Filter to only elements that might be actual listings
                for elem in elements:
                    try:
                        text = await elem.inner_text()
                        # Check if it looks like a listing (has address pattern, price, or property details)
                        if (re.search(r'\d+\s+[A-Z]', text) or 
                            re.search(r'\$\d+', text) or 
                            re.search(r'(?:bedroom|bathroom|bed|bath)', text, re.IGNORECASE) or
                            re.search(r'(?:sq\s*ft|square\s*feet)', text, re.IGNORECASE)):
                            listing_elements.append(elem)
                    except:
                        continue
                
                if listing_elements:
                    print(f"Found {len(listing_elements)} potential listings using selector: {selector}")
                    break
        
        # If no structured listings found, try to find any result containers
        if not listing_elements:
            print("No structured listings found, trying to find result containers...")
            # Look for any divs that might contain listing information
            all_divs = await page.query_selector_all("div")
            for div in all_divs[:200]:  # Check first 200 divs
                try:
                    text = await div.inner_text()
                    # Check if it contains property-like information
                    if (re.search(r'\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)', text) and
                        (re.search(r'\$\d+', text) or re.search(r'(?:bedroom|bathroom)', text, re.IGNORECASE))):
                        listing_elements.append(div)
                        if len(listing_elements) >= 50:  # Limit to 50
                            break
                except:
                    continue
            
            if listing_elements:
                print(f"Found {len(listing_elements)} potential listings from div search")

        # Extract data from listing elements
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
        "source": "koto"
    }


async def extract_listing_data(element) -> dict | None:
    """Extract data from a single listing element."""
    try:
        # Get all text from the element
        text = await element.inner_text()
        
        # Try to find address - look for address pattern
        address = None
        address_match = re.search(r'(\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct))', text)
        if address_match:
            address = address_match.group(1).strip()
        
        # If no address found, try to get from headings
        if not address:
            for tag in ['h1', 'h2', 'h3', 'h4']:
                heading = await element.query_selector(tag)
                if heading:
                    heading_text = await heading.inner_text()
                    if re.search(r'\d+\s+[A-Z]', heading_text):
                        address = heading_text.strip()
                        break
        
        # Skip if no address found
        if not address or len(address) < 5:
            return None
        
        # Try to find price
        price = None
        price_match = re.search(r'\$([\d,]+)', text)
        if price_match:
            try:
                price = int(price_match.group(1).replace(',', ''))
            except:
                pass
        
        # Try to find bedrooms
        bedrooms = None
        if re.search(r'studio', text, re.IGNORECASE):
            bedrooms = 0
        else:
            beds_match = re.search(r'(\d+)\s*(?:bedroom|bed|br|bd)', text, re.IGNORECASE)
            if beds_match:
                bedrooms = int(beds_match.group(1))
        
        # Try to find bathrooms
        bathrooms = None
        baths_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:bathroom|bath|ba)', text, re.IGNORECASE)
        if baths_match:
            bathrooms = float(baths_match.group(1))
        
        # Determine category
        category = "Residential"
        if re.search(r'office|commercial', text, re.IGNORECASE):
            category = "Commercial"
        elif re.search(r'storage', text, re.IGNORECASE):
            category = "Storage"
        
        return {
            "address": address,
            "price": price,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "category": category,
            "source": "koto"
        }
    except Exception as e:
        print(f"Error parsing listing: {e}")
        return None
