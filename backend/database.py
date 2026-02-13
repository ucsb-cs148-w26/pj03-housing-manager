"""
SQLite database operations for storing scraped listings.
Uses aiosqlite for async access with WAL mode for concurrent reads.
"""

import os
from datetime import datetime, timezone

import aiosqlite

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "data", "listings.db"))


async def init_db():
    """Create the listings table if it doesn't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        await db.execute("""
            CREATE TABLE IF NOT EXISTS listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT NOT NULL,
                source TEXT NOT NULL,
                price INTEGER,
                bedrooms INTEGER,
                bathrooms REAL,
                category TEXT DEFAULT 'Residential',
                square_feet INTEGER,
                move_in_date TEXT,
                listing_link TEXT,
                scraped_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(address, source)
            )
        """)
        await db.commit()


async def upsert_listings(listings: list[dict], source: str):
    """Insert or update listings for a given source."""
    now = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        for item in listings:
            link = item.get("listing_link") or item.get("url")
            await db.execute(
                """
                INSERT INTO listings (address, source, price, bedrooms, bathrooms,
                                      category, square_feet, move_in_date, listing_link,
                                      scraped_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(address, source) DO UPDATE SET
                    price = excluded.price,
                    bedrooms = excluded.bedrooms,
                    bathrooms = excluded.bathrooms,
                    category = excluded.category,
                    square_feet = excluded.square_feet,
                    move_in_date = excluded.move_in_date,
                    listing_link = excluded.listing_link,
                    updated_at = excluded.updated_at
                """,
                (
                    item.get("address", ""),
                    source,
                    item.get("price"),
                    item.get("bedrooms"),
                    item.get("bathrooms"),
                    item.get("category", "Residential"),
                    item.get("square_feet"),
                    item.get("move_in_date") or item.get("date_available"),
                    link,
                    now,
                    now,
                ),
            )
        await db.commit()


async def get_all_listings() -> list[dict]:
    """Return all listings as dicts. Aliases listing_link → url for frontend compat."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT address, source, price, bedrooms, bathrooms,
                   category, square_feet, move_in_date,
                   listing_link AS url, scraped_at, updated_at
            FROM listings
            ORDER BY updated_at DESC
            """
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_scrape_metadata() -> dict:
    """Return total listing count and most recent update timestamp."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM listings")
        (total,) = await cursor.fetchone()
        cursor = await db.execute("SELECT MAX(updated_at) FROM listings")
        (last_updated,) = await cursor.fetchone()
        return {"total_listings": total, "last_updated": last_updated}
