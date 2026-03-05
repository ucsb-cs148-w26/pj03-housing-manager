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