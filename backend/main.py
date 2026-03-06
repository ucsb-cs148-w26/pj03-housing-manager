"""
Housing Manager Backend API
Provides endpoints for scraping rental listings from various sources.
"""
import asyncio
import base64
import json
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scrapers.meridian import scrape_meridian
from scrapers.solis import scrape_solis
from scrapers.Koto import scrape_koto
from scrapers.playalife import scrape_playalife
from scrapers.wolfe_scraper import scrape_wolfe

from database import (
    init_db, get_all_listings, get_scrape_metadata,
    create_sublease_post, get_sublease_posts, delete_sublease_post,
    create_comment, get_comments_for_post, delete_comment,
    init_db,
    get_all_listings,
    get_scrape_metadata,
    upsert_user,
    get_user_by_sub,
    get_all_users,
    update_user_role,
)
from scheduler import scrape_loop, run_all_scrapers_to_db

VALID_ROLES = {"user", "admin"}


def decode_jwt_payload(token: str) -> dict:
    """Decode the payload section of a JWT without verifying the signature."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
    padding = "=" * (4 - len(parts[1]) % 4)
    decoded = base64.urlsafe_b64decode(parts[1] + padding)
    return json.loads(decoded)


async def require_admin(authorization: str = Header(default=None)) -> dict:
    """FastAPI dependency that enforces admin-only access."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization[7:]
    try:
        payload = decode_jwt_payload(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    google_sub = payload.get("sub")
    if not google_sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = await get_user_by_sub(google_sub)
    if not user or user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


class LoginRequest(BaseModel):
    credential: str


class RoleUpdateRequest(BaseModel):
    role: str

_scrape_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _scrape_task
    await init_db()
    _scrape_task = asyncio.create_task(scrape_loop())
    yield
    _scrape_task.cancel()
    try:
        await _scrape_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="Housing Manager API",
    description="API for scraping and aggregating rental listings",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend
# In production, set ALLOWED_ORIGINS env var to your Vercel URL
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "Housing Manager API"}


@app.get("/scrape/meridian")
async def scrape_meridian_endpoint():
    """
    Scrape rental listings from Meridian Group Real Estate.
    Returns listings with price, bedrooms, bathrooms, address, and category.
    """
    try:
        result = await scrape_meridian()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")

@app.get("/scrape/playalife")
async def scrape_playalife_endpoint():
    try:
        result = await scrape_playalife()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.get("/scrape/koto")
async def scrape_koto_endpoint():
    """
    Scrape rental listings from Koto Group.
    Returns listings with price, bedrooms, bathrooms, address, and category.
    """
    try:
        result = await scrape_koto()
        # Always return the result - if it has an error field, frontend will display it
        return result
    except Exception as e:
        error_msg = str(e)
        error_type = type(e).__name__
        print(f"Exception in koto endpoint ({error_type}): {error_msg}")

        # Provide more helpful error messages
        if "Load failed" in error_msg or "net::ERR" in error_msg or "net::" in error_msg:
            user_msg = "The website failed to load. This could be due to network issues, the website being down, or blocking automated access."
        elif "timeout" in error_msg.lower():
            user_msg = "The request timed out. The website may be slow or not responding."
        else:
            user_msg = f"Scraping failed: {error_msg}"

        raise HTTPException(status_code=500, detail=user_msg)


@app.get("/scrape/wolfe")
async def scrape_wolfe_endpoint():
    """
    Scrape rental listings from Wolfe & Associates (Isla Vista).
    Returns listings with price, bedrooms, bathrooms, address, availability, and contact info.
    """
    try:
        result = await scrape_wolfe()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.get("/scrape/solis")
async def scrape_solis_endpoint():
    """
    Scrape rental listings from Solis Isla Vista.
    Returns listings with price, bedrooms, bathrooms, address, square footage, and move-in date.
    """
    try:
        result = await scrape_solis()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.get("/scrape/all")
async def scrape_all_endpoint():
    """
    Scrape rental listings from all property management companies in parallel.
    Returns combined listings with source field on each. Failed scrapers are skipped.
    """
    scrapers = [
        ("meridian", scrape_meridian),
        ("playalife", scrape_playalife),
        ("koto", scrape_koto),
        ("solis", scrape_solis),
        ("wolfe", scrape_wolfe),
    ]

    async def run_one(name, fn):
        try:
            return await fn()
        except Exception as e:
            print(f"Scraper {name} failed: {e}")
            return {"listings": [], "scraped_at": None, "source": name}

    results = await asyncio.gather(*[run_one(name, fn) for name, fn in scrapers])
    all_listings = []
    latest_at = None
    for data in results:
        listings = data.get("listings") or []
        for listing in listings:
            if "source" not in listing:
                listing["source"] = data.get("source", "unknown")
            all_listings.append(listing)
        scraped_at = data.get("scraped_at")
        if scraped_at and (latest_at is None or scraped_at > latest_at):
            latest_at = scraped_at
    if latest_at is None:
        latest_at = datetime.now(timezone.utc).isoformat() + "Z"
    return {
        "listings": all_listings,
        "scraped_at": latest_at,
        "sources": [name for name, _ in scrapers],
    }


@app.get("/listings")
async def listings_endpoint():
    """Return all listings from the database (pre-scraped)."""
    try:
        listings = await get_all_listings()
        meta = await get_scrape_metadata()
        sources = list({l["source"] for l in listings})
        return {
            "listings": listings,
            "last_updated": meta["last_updated"],
            "total": meta["total_listings"],
            "sources": sources,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")


@app.post("/listings/refresh")
async def refresh_listings_endpoint():
    """Manually trigger a full re-scrape and update the database."""
    try:
        await run_all_scrapers_to_db()
        meta = await get_scrape_metadata()
        return {
            "status": "ok",
            "total": meta["total_listings"],
            "last_updated": meta["last_updated"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refresh failed: {str(e)}")


#  Sublease post endpoints 

class SubleasePostIn(BaseModel):
    title: str
    location: str
    rent: str
    dates: str
    description: str
    author_email: str
    author_name: str


@app.get("/subleases")
async def get_subleases():
    """Return all sublease posts from the database."""
    try:
        posts = await get_sublease_posts()
        return {"posts": posts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")


@app.post("/subleases", status_code=201)
async def post_sublease(body: SubleasePostIn):
    """Create a new sublease post."""
    try:
        post = await create_sublease_post(body.model_dump())
        return post
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")


@app.delete("/subleases/{post_id}")
async def delete_sublease(post_id: int, author_email: str):
    """Delete a sublease post. Only the original author (matched by email) can delete."""
    try:
        deleted = await delete_sublease_post(post_id, author_email)
        if not deleted:
            raise HTTPException(status_code=404, detail="Post not found or not owned by you.")
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete post: {str(e)}")


#  Sublease comment endpoints 

class CommentIn(BaseModel):
    text: str
    author_name: str
    author_email: str


@app.get("/subleases/{post_id}/comments")
async def get_comments(post_id: int):
    """Return all comments for a sublease post."""
    try:
        comments = await get_comments_for_post(post_id)
        return {"comments": comments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {str(e)}")


@app.post("/subleases/{post_id}/comments", status_code=201)
async def post_comment(post_id: int, body: CommentIn):
    """Add a comment to a sublease post."""
    try:
        comment = await create_comment(post_id, body.model_dump())
        return comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create comment: {str(e)}")


@app.delete("/subleases/{post_id}/comments/{comment_id}")
async def delete_comment_endpoint(post_id: int, comment_id: int, author_email: str):
    """Delete a comment. Only the original author can delete."""
    try:
        deleted = await delete_comment(comment_id, author_email)
        if not deleted:
            raise HTTPException(status_code=404, detail="Comment not found or not owned by you.")
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete comment: {str(e)}")


#  Scrapers list 
@app.post("/auth/login")
async def auth_login(body: LoginRequest):
    """
    Upsert a user from their Google credential JWT.
    Returns the user's profile including their role.
    """
    try:
        payload = decode_jwt_payload(body.credential)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid credential")
    email = payload.get("email")
    google_sub = payload.get("sub")
    if not email or not google_sub:
        raise HTTPException(status_code=400, detail="Missing email or sub in token")
    user = await upsert_user(email=email, google_sub=google_sub)
    return {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


@app.get("/admin/users")
async def admin_list_users(current_user: dict = Depends(require_admin)):
    """Return all users. Requires admin role."""
    users = await get_all_users()
    return [
        {
            "id": u["id"],
            "email": u["email"],
            "role": u["role"],
            "createdAt": u["created_at"],
        }
        for u in users
    ]


@app.patch("/admin/users/{user_id}/role")
async def admin_update_role(
    user_id: int,
    body: RoleUpdateRequest,
    current_user: dict = Depends(require_admin),
):
    """Update a user's role. Requires admin role."""
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(VALID_ROLES)}",
        )
    updated = await update_user_role(user_id, body.role)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": updated["id"],
        "email": updated["email"],
        "role": updated["role"],
        "createdAt": updated["created_at"],
    }


@app.get("/scrapers")
async def list_scrapers():
    """List available scrapers."""
    return {
        "scrapers": [
            {
                "id": "meridian",
                "name": "Meridian Group Real Estate",
                "url": "https://meridiangrouprem.com/",
                "endpoint": "/scrape/meridian"
            },
            {
                "id": "solis",
                "name": "Solis Isla Vista",
                "url": "https://solisislavista.com/",
                "endpoint": "/scrape/solis"
            },
            {
                "id": "playalife",
                "name": "PlayaLife IV",
                "url": "https://www.playalifeiv.com/",
                "endpoint": "/scrape/playalife"
            },
            {
                "id": "koto",
                "name": "Koto Group",
                "url": "https://www.kotogroup.com/",
                "endpoint": "/scrape/koto"
            },
            {
                "id": "wolfe",
                "name": "Wolfe & Associates (Isla Vista)",
                "url": "https://www.rlwa.com/",
                "endpoint": "/scrape/wolfe"
            }
        ]
    }