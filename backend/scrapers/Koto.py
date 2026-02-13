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

        await page.goto("https://www.kotogroup.com/vacancies")
        
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(3)

        listing_elements = []
        
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
                for elem in elements:
                    try:
                        text = await elem.inner_text()
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
        
        if not listing_elements:
            print("No structured listings found, trying to find result containers...")
            all_divs = await page.query_selector_all("div")
            for div in all_divs[:200]:
                try:
                    text = await div.inner_text()
                    if (re.search(r'\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)', text) and
                        (re.search(r'\$\d+', text) or re.search(r'(?:bedroom|bathroom)', text, re.IGNORECASE))):
                        listing_elements.append(div)
                        if len(listing_elements) >= 50:
                            break
                except:
                    continue
            
            if listing_elements:
                print(f"Found {len(listing_elements)} potential listings from div search")

        seen_urls = set()
        seen_addresses = set()
        
        for element in listing_elements:
            try:
                listing = await extract_listing_data(element)
                if listing:
                    url = listing.get("listing_link")
                    if url:
                        if url in seen_urls:
                            continue
                        seen_urls.add(url)
                    else:
                        addr = listing.get("address", "").lower()
                        if addr in seen_addresses:
                            continue
                        seen_addresses.add(addr)
                    
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
        text = await element.inner_text()
        
        listing_link = None
        link = await element.query_selector("a")
        
        if link:
            href = await link.get_attribute("href")
            if href and not href.startswith("#") and not href.startswith("javascript:"):
                if href.startswith("http"):
                    listing_link = href
                elif href.startswith("/"):
                    listing_link = f"https://www.kotogroup.com{href}"
                else:
                    listing_link = f"https://www.kotogroup.com/{href}"

        if "93117" not in text and (not listing_link or "93117" not in listing_link):
            return None
        
        address = None
        unit = None
        
        if listing_link:
            url_match = re.search(r'/(\d+[a-z]?)-([a-z-]+?)(?:-(unit|apt|suite|ste)-([a-z0-9]+))?-(?:goleta|isla-vista|iv|santa-barbara)-ca-93117', listing_link, re.IGNORECASE)
            if url_match:
                street_num = url_match.group(1)
                street_name = url_match.group(2).replace('-', ' ').title()
                if url_match.group(3) and url_match.group(4):
                    unit = url_match.group(4).upper()
                address = f"{street_num} {street_name}"
            else:
                url_match2 = re.search(r'/(\d+[a-z]?)-([a-z-]+?)-(?:goleta|isla-vista|iv|santa-barbara)', listing_link, re.IGNORECASE)
                if url_match2:
                    street_num = url_match2.group(1)
                    street_name = url_match2.group(2).replace('-', ' ').title()
                    address = f"{street_num} {street_name}"
                else:
                    url_match3 = re.search(r'/(\d+[a-z]?)-([a-z-]+?)(?:-ca)?-93117', listing_link, re.IGNORECASE)
                    if url_match3:
                        street_num = url_match3.group(1)
                        street_name = url_match3.group(2).replace('-', ' ').title()
                        address = f"{street_num} {street_name}"
        
        if not unit:
            unit_match = re.search(r'(?:unit|apt|suite|ste|#)\s*([a-z0-9]+)', text, re.IGNORECASE)
            if unit_match:
                unit = unit_match.group(1).upper()
        
        if not address:
            full_addr_match = re.search(r'(\d+[A-Za-z]?\s+[A-Za-z][a-z]+(?:\s+[A-Za-z][a-z]+)?(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|Tarde|Del Playa|Embarcadero))?)', text, re.IGNORECASE)
            if full_addr_match:
                address = full_addr_match.group(1).strip()
        
        if not address:
            address_match = re.search(r'(\d+[A-Za-z]?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)', text)
            if address_match:
                address = address_match.group(1).strip()
        
        if not address:
            for tag in ['h1', 'h2', 'h3', 'h4']:
                heading = await element.query_selector(tag)
                if heading:
                    heading_text = await heading.inner_text()
                    if re.search(r'\d+\s+[A-Z]', heading_text):
                        address = heading_text.strip()
                        break
        
        if address:
            if unit:
                address = f"{address} Unit {unit}, Goleta, CA 93117"
            else:
                address = f"{address}, Goleta, CA 93117"
        
        if not address or len(address) < 5:
            return None
        
        price = None
        price_match = re.search(r'\$([\d,]+)', text)
        if price_match:
            try:
                price = int(price_match.group(1).replace(',', ''))
            except:
                pass
        
        bedrooms = None
        if re.search(r'studio', text, re.IGNORECASE):
            bedrooms = 0
        else:
            beds_match = re.search(r'(\d+)\s*(?:bedroom|bed|br|bd)', text, re.IGNORECASE)
            if beds_match:
                bedrooms = int(beds_match.group(1))
        
        bathrooms = None
        baths_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:bathroom|bath|ba)', text, re.IGNORECASE)
        if baths_match:
            bathrooms = float(baths_match.group(1))
        
        category = "Residential"
        if re.search(r'office|commercial', text, re.IGNORECASE):
            category = "Commercial"
        elif re.search(r'storage', text, re.IGNORECASE):
            category = "Storage"
        
        listing = {
            "listing_link": listing_link,
            "address": address,
            "price": price,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "category": category,
            "source": "koto"
        }
        
        return listing
    except Exception as e:
        print(f"Error parsing listing: {e}")
        return None