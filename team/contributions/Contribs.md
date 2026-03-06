# Team Contributions

This document summarizes the contributions made by each team member during development.  
It also provides context for GitHub commit activity and any pair programming notes.

---

# Alex Jeong

## Contributions

- **Playalife housing scraper**
  - Implemented a backend scraper that collects listings from the Playalife website and integrates them into the application.
  - Extracted listing data including price, address, bedrooms, bathrooms, listing links, and additional listing details.
  - Exposed the scraped data through a backend API endpoint so it can be consumed by the frontend listing components.

- **Listing interaction improvements**
  - Updated the `ListingCard` component so users can open the original listing source page directly by clicking on a card when a URL exists.
  - Implemented URL fallback logic (`listing_link` or `url`) so cards work with multiple backend formats.
  - Ensured listings without valid URLs remain visible but non-clickable to avoid broken links.

- **Listing sharing feature**
  - Implemented a multi-select workflow in the Browse All Listings view that allows users to select multiple listings.
  - Added functionality to generate and copy selected listing links to the clipboard.
  - Designed the feature to help users easily share potential housing options with roommates or friends.

- **Theme automation**
  - Implemented an automatic theme mode that switches between light and dark mode based on the user's local time.
  - Ensured the correct theme loads on application start and updates if the time crosses the light/dark boundary while the app is open.
  - Preserved manual theme selection so users can override the automatic mode.

- **Component testing**
  - Created and updated unit tests for the `ListingCard` React component.
  - Verified correct rendering of listing information and ensured tests reflect the updated clickable-card behavior.

- **Product Owner responsibilities**
  - Wrote and organized user stories for features.
  - Maintained the team Kanban board and tracked issue progress through the development cycle.
  - Led team meetings and helped coordinate development to ensure features were implemented according to the product goals.

---

# Alex Yoon

## Contributions
- (Add your bullet points here.)


---

# Jeffrey Keem

## Contributions

### Homepage UI (`src/components/`, `src/App.jsx`, `src/index.css`)
- Built the initial homepage layout and styling, including `App.jsx` and `App.css` updates.
- Created multiple homepage components from scratch: `Header`, `Footer`, `AboutSection`, `RecentListingsSection`, and `ListingCard` — totaling 634 new lines of JSX and CSS.

### Light/Dark Mode Toggle (`src/components/ThemeToggle/`)
- Implemented a light and dark mode toggle feature with a new `ThemeToggle` component.
- Updated CSS across 12 files (Header, Footer, ListingCard, ListingList, AdminUsersPage, SubleaseListings, AllListingsSection, etc.) to support theme-aware styling.
- Added global theme variables in `src/index.css`.

### Sublease Form Validation (`src/components/SubleaseListings/`)
- Added form validation to the sublease listings form to improve user experience.
- Refactored and expanded `SubleaseListings.jsx` (291 new lines) and added 100 lines of supporting CSS.

### Project Setup & Documentation
- Set up the initial project repo (hello world, `.gitignore`, license).
- Removed `node_modules` from the repository.
- Authored team documents: `AGREEMENTS.md`, `NORMS.md`, `LEADERSHIP.md`, and `AI_CODING.md`.


---

# Nathan Mitter

## Contributions

- **Initial sublease posting capability** ([#74](https://github.com/ucsb-cs148-w26/pj03-housing-manager/pull/74))
  - Built out the sublease post form and wired the "Post a Sublease" button to submit new listings.
  - Laid the groundwork for the full sublease feature (auth gating and styling followed in subsequent PRs).

- **Login requirement for sublease posting** ([#114](https://github.com/ucsb-cs148-w26/pj03-housing-manager/pull/114))
  - Restricted sublease post creation to authenticated users only.
  - Added a styled login prompt displayed to unauthenticated users in place of the post form.

- **Login prompt UI polish** ([#116](https://github.com/ucsb-cs148-w26/pj03-housing-manager/pull/116))
  - Reformatted the login prompt shown on the sublease page for better visual consistency with the rest of the UI.

- **Connected sublease posts and comments to the database** ([#119](https://github.com/ucsb-cs148-w26/pj03-housing-manager/pull/119))
  - Wired sublease post creation, retrieval, and deletion to the SQLite backend.
  - Wired comment creation, retrieval, and deletion to the database with full cascade behavior.
  - Added `sublease_posts` and `sublease_comments` tables to `database.py`.

- **Fixed broken backend after merge** ([#121](https://github.com/ucsb-cs148-w26/pj03-housing-manager/pull/121))
  - Resolved a bad merge conflict in `database.py` where `get_comments_for_post` was missing its closing lines and `upsert_user` had been spliced into the middle of it, causing a `SyntaxError` on startup.
  - Cleaned up duplicate imports in `main.py`.

- **Displayed poster email on sublease listings and comments** ([#122](https://github.com/ucsb-cs148-w26/pj03-housing-manager/pull/122))
  - Added author email display on sublease post cards and comment entries so users can contact posters off-site.


---

# Kyle Villeponteau

## Contributions

- **Browse All Listings feature **
  - Built the `AllListingsSection` React component that lets users load all listings at once and then filter by price range, bedrooms, bathrooms, square footage, and source.
  - Updated shared components (`ListingCard`, `ListingList`) to support square-footage display and customizable empty-state messages so the new section can reuse existing UI.
  - Wired the new section into `App.jsx` and the header navigation so "Browse All" is a first-class part of the home page.

- **Koto scraper robustness and deduplication**
  - Improved `backend/scrapers/Koto.py` to extract stable listing URLs from the Koto site so each card can deep-link back to the original property page.
  - Implemented deduplication logic (by URL and, when needed, by normalized address) so the same Koto listing does not appear multiple times in the combined results.
  - Tightened address/price/bed/bath parsing heuristics to better handle noisy or inconsistent markup on the Koto vacancies page.

- **Developer experience and debugging support**
  - Helped debug FastAPI syntax and import issues in `main.py` and `Koto.py` that were preventing the backend from starting under `uvicorn --reload`.
  - Verified that all scraper modules compile and can be imported correctly inside the backend virtual environment.
  - Documented the Browse All feature work and use of AI assistance in `team/AI_CODING.md` so future contributors understand the design and trade-offs.

## Testing

- Manually exercised the `/scrape/all` endpoint and individual scraper endpoints locally, checking that response shapes match the frontend's expectations and that each listing is tagged with the cor[...]
- Used the Browse All UI to verify that filters behave as expected across combinations (price ranges, studio vs multi-bedroom, various bathroom counts, square-footage bounds, and per-source chips).
- Spot-checked Koto scraper output against the live site to confirm that addresses, prices, and bed/bath counts are accurate and that duplicate listings are removed.
- Confirmed that the React app still builds and routes correctly after wiring the new section into `App.jsx` and updating the header nav.


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

- **Scraper validation:** After each scraper fix, verified output programmatically by hitting the `/scrape/solis` endpoint and asserting all 34 listings had a `link`, correct `null` bedrooms for studi[...]
- **Bug reproduction:** Traced the 48-Hour Special bedroom bug to the exact DOM rendering difference in the Entrata widget before writing the fix
- **Debug tooling:** Used Playwright's frame inspection and live page HTML dumps to diagnose why iframe content detection was failing, which led to discovering the JSON data approach
- **Testing framework:** Set up Vitest as the project's frontend testing framework (`vitest`, `@testing-library/react`, `jsdom`); documented the testing strategy in `team/TESTING.md`
