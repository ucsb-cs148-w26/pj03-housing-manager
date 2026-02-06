# Backend Scrapers

The backend uses [Playwright](https://playwright.dev/python/) to scrape rental listings from Isla Vista property management websites. Each scraper launches a headless Chromium browser, navigates to a company's listings page, extracts listing data via CSS selectors and regex, and returns structured JSON.

## Why These Companies?

We targeted rental companies whose listings are rendered as scrapeable HTML on their websites. Some companies (e.g. Kamap Rentals) publish listings as PDFs, which are unreliable to parse programmatically and were excluded.

## Current Scrapers

| Scraper | File | Target URL | Notes |
|---------|------|------------|-------|
| Meridian Group | `meridian.py` | `meridiangrouprem.com/available-rentals/` | Listings in `.prop-list` containers |
| Wolfe & Associates | `wolfe_scraper.py` | `rlwa.com/isla-vista-listings` | Isla Vista only; includes availability dates and application links |
| Koto Group | `Koto.py` | `kotogroup.com/vacancies` | Uses broad fallback selectors because the site structure is unpredictable |
| PlayaLife IV | `playalife.py` | `playalifeiv.com/vacancies` | Cleanest structure; uses `.listing-item` elements |

## How a Scraper Works

Every scraper follows the same pattern:

1. **Launch browser** &mdash; `async_playwright` starts a headless Chromium instance.
2. **Navigate** &mdash; `page.goto(url)` loads the listings page.
3. **Wait for content** &mdash; `wait_for_load_state("networkidle")` plus an `asyncio.sleep()` delay (2-3 seconds) to let dynamically-rendered content finish loading.
4. **Select elements** &mdash; `page.query_selector_all(selector)` finds listing containers on the page.
5. **Extract data** &mdash; An `extract_listing_data()` function pulls fields from each element using CSS selectors and regex.
6. **Return JSON** &mdash; The scraper returns a dict with `listings`, `scraped_at`, and `source`.

## Response Format

All scrapers return this top-level structure:

```json
{
  "listings": [ ... ],
  "scraped_at": "2025-01-28T12:00:00Z",
  "source": "scraper_id"
}
```

### Core listing fields (all scrapers)

| Field | Type | Description |
|-------|------|-------------|
| `address` | `string` | Street address of the listing |
| `price` | `int \| null` | Monthly rent in dollars |
| `bedrooms` | `int \| null` | Number of bedrooms (0 = studio) |
| `bathrooms` | `float \| null` | Number of bathrooms |
| `category` | `string` | `"Residential"`, `"Commercial"`, or `"Storage"` |
| `source` | `string` | Scraper ID (e.g. `"meridian"`, `"wolfe"`) |

### Extra fields (Wolfe only)

| Field | Type | Description |
|-------|------|-------------|
| `listing_link` | `string \| null` | URL to the full listing page |
| `date_available` | `string \| null` | Move-in availability date |
| `application_link` | `string` | Link to the rental application |
| `contact_info` | `object` | Phone, email, and office address |
| `utilities_amenities` | `list \| null` | Amenities and utilities info |

## Adding a New Scraper

### 1. Check that the site is scrapeable

Open the rental company's listings page in a browser and inspect the HTML. You need listing data rendered as actual DOM elements (not inside a PDF, iframe to an external service, or canvas). If the content loads dynamically, Playwright can handle it — just make sure the data ends up in the DOM.

### 2. Create the scraper file

Add a new file in `backend/scrapers/` (e.g. `newsite.py`):

```python
from playwright.async_api import async_playwright
from datetime import datetime
import asyncio
import re

async def scrape_newsite() -> dict:
    listings = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("https://www.newsite.com/listings")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)

        listing_elements = await page.query_selector_all(".your-selector")

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
        "source": "newsite"
    }

async def extract_listing_data(element) -> dict | None:
    # Extract fields using CSS selectors and regex.
    # Must return at least the core fields: address, price,
    # bedrooms, bathrooms, category, source.
    ...
```

### 3. Register the API endpoint

In `backend/main.py`, import the function and add a route:

```python
from scrapers.newsite import scrape_newsite

@app.get("/scrape/newsite")
async def scrape_newsite_endpoint():
    try:
        result = await scrape_newsite()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")
```

Also add an entry to the `/scrapers` metadata endpoint in the same file.

### 4. Add to the frontend dropdown

In `src/components/ScraperSection/ScraperSection.jsx`, add to the `SCRAPERS` array:

```javascript
{ id: 'newsite', name: 'New Site Name', url: 'newsite.com' },
```

## Scraper Maintenance

Scrapers depend on the structure of external websites. If a rental company redesigns their site, the scraper's CSS selectors will likely break. Signs of a broken scraper:

- The endpoint returns `{"listings": []}` when you know listings exist on the site.
- Fields come back as `null` that previously had values.

To debug, inspect the target site's current HTML and update the selectors in `extract_listing_data()` to match.
