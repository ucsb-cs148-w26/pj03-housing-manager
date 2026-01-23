import requests
from bs4 import BeautifulSoup
import pandas as pd

URL = "https://sierrapropsb.com/student-housing/"

headers = {
    "User-Agent": "Mozilla/5.0"
}

response = requests.get(URL, headers=headers)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

listings = soup.select("div.rmwb_listing-wrapper")

results = []

for listing in listings:
    # --- Data attributes ---
    property_name = listing.get("data-propertyname")
    address = listing.get("data-address")
    rent = listing.get("data-rent")
    bedrooms = listing.get("data-bedrooms")
    bathrooms = listing.get("data-bathrooms")
    image_url = listing.get("data-images")
    uid = listing.get("data-uid")

    # --- Availability ---
    available = None
    for li in listing.select("li"):
        title = li.select_one(".rmwb_info-title")
        detail = li.select_one(".rmwb_info-detail")
        if title and "Available" in title.text:
            available = detail.text.strip()

    # --- Description ---
    description_tag = listing.select_one("p.rmwb_description")
    description = description_tag.text.strip() if description_tag else None

    # --- Links ---
    unit_link = listing.select_one("a.more-details")
    apply_link = listing.select_one("a[target='_blank']")

    results.append({
        "property_name": property_name,
        "address": address,
        "rent": rent,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "available_date": available,
        "description": description,
        "image_url": image_url,
        "unit_url": f"https://sierrapropsb.com{unit_link['href']}" if unit_link else None,
        "apply_url": apply_link["href"] if apply_link else None,
        "uid": uid
    })

# Save to CSV
df = pd.DataFrame(results)
df.to_csv("sierra_student_housing.csv", index=False)

print(f"Scraped {len(df)} listings")
