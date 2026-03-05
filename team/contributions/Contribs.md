# Team Contributions

This document summarizes the contributions made by each team member during development.  
It also provides context for GitHub commit activity and any pair programming notes.

---

# Alex Jeong

## Contributions
- (Add your bullet points here describing code, features, testing, or documentation you contributed.)


---

# Alex Yoon

## Contributions
- (Add your bullet points here.)


---

# Jeffrey Keem

## Contributions
- (Add your bullet points here.)


---

# Nathan Mitter

## Contributions
- (Add your bullet points here.)


---

# Kyle Villeponteau

## Contributions
- (Add your bullet points here.)


---

# Om Kulkarni

## Contributions
- (Add your bullet points here.)


---

# Timothy Nguyen

## Contributions

- Implemented image upload functionality for the sublease listing form.
- Added image validation requiring users to upload at least one photo before posting a listing.
- Built an image preview grid so users can see uploaded photos before submitting a listing.
- Added support for uploading multiple images through the listing form.
- Implemented image display on each listing card so posted listings show photos.
- Added supporting CSS for the image upload input, preview grid, and listing card images.

- Added clickable listing links to property listings across multiple scrapers.
- Updated multiple scrapers (Wolfe & Associates, PlayaLife, Meridian, and Koto) to extract and return a `listing_link` field.
- Ensured listing URLs are converted to absolute paths where needed.
- Implemented frontend changes so property addresses link directly to the original property page.

## Testing

- Tested the sublease listing form locally by uploading single and multiple images.
- Verified image previews appear before submission.
- Confirmed listings display images correctly after posting.
- Verified the form blocks submission when no images are uploaded.
- Tested scraper updates locally and confirmed `listing_link` appears in API responses.
- Verified listing links display correctly on the frontend and open the correct property pages.



---

# Bryce Inouye

# Bryce Inouye Contributions

**Role:** Testing / QA Coordinator  

---

## Summary

Contributed across three areas:
1. Solis property scraper (build + refactor)
2. Admin user management frontend
3. Admin backend with Google OAuth integration

---

## 1. Solis Scraper (`backend/scrapers/solis.py`)

**Commits:** `2dc2eb7`, `0505f35`, `15b1e43`, `3daff2d`

Built the Solis IV scraper using Playwright to extract listing data from an Entrata/LeaseLeads iframe.

### Key Improvements

- **Initial version:**  
  - Located iframe dynamically  
  - Extracted address, price, beds, baths, sq ft, and move-in date via DOM queries  

- **Bug fix (48-Hour Special issue):**  
  - Promo banner caused `48` to be parsed as bedroom count  
  - Root cause: index-based span extraction  
  - Fix: switched to keyword-based content matching (`bed`, `studio`, `bath`, `sq. ft.`)

- **Major Refactor (current branch):**  
  - Discovered listing data embedded as JSON in `data-page` (Inertia.js)  
  - Rewrote scraper to parse JSON directly  
  - Benefits:
    - Eliminated DOM parsing fragility
    - Added unique listing URL (`apply_link.url`)
    - Faster and simpler
    - Correct studio handling (`0 → null`)

---

## 2. Admin User Management Frontend (`src/components/AdminUsersPage/`)

**Commits:** `4a07edb`, `22874ea`

Designed and implemented admin dashboard UI.

### Iteration 1
- Built `AdminUsersPage` + styling
- Added routing + admin header link
- Rendered user table (email, role, created date)
- Used mock data + temporary `isAdmin = true`

### Iteration 2
- Added per-user role dropdown
- Save button activates on change
- Optimistic UI with:
  - Per-row loading state
  - Success/error banners
  - Rollback on failure
- Connected to `PATCH /admin/users/{id}/role`

### Integration (current branch)
- Replaced mocks with live backend calls
- `GET /admin/users` on mount (Bearer auth)
- `isAdmin` derived from stored user role
- Added loading state
- Updated Save to match backend `PATCH` route

---

## 3. Admin Backend + Google OAuth

**Branch:** `bi_admin_dashboard` (uncommitted)

Implemented full authentication + admin role management.

### Database (`database.py`)
- Added `users` table (`id`, `email`, `google_sub`, `role`, `created_at`)
- `upsert_user` (preserves role on conflict)
- CRUD helpers:
  - `get_user_by_sub`
  - `get_all_users`
  - `update_user_role`

### API (`main.py`)
- `decode_jwt_payload` (no signature verification — acceptable for class scope)
- `require_admin` dependency (401/403 handling)
- `POST /auth/login` — upserts user, returns role
- `GET /admin/users` — admin-only
- `PATCH /admin/users/{id}/role` — admin-only with role validation

### Auth Flow (`src/utils/auth.js`)
- Made `handleCredentialResponse` async
- Calls `POST /auth/login` after Google login
- Stores backend-returned role in `localStorage`
- Added `getCredential()` helper
- Updated `signOut()` to clear credential

---

## 4. Testing / QA

As Testing/QA Coordinator, established the team's testing approach and validated features before merging.

- **Scraper validation:** After each scraper fix, verified output programmatically by hitting the `/scrape/solis` endpoint and asserting all 34 listings had a `link`, correct `null` bedrooms for studios, and zero occurrences of `bedrooms=48`
- **Bug reproduction:** Traced the 48-Hour Special bedroom bug to the exact DOM rendering difference in the Entrata widget before writing the fix
- **Debug tooling:** Used Playwright's frame inspection and live page HTML dumps to diagnose why iframe content detection was failing, which led to discovering the JSON data approach
- **Testing framework:** Set up Vitest as the project's frontend testing framework (`vitest`, `@testing-library/react`, `jsdom`); documented the testing strategy in `team/TESTING.md`