## Bryce Inouye

### Experiment Description
I used Claude Code to help generate a documentation folder (`docs/`) for the project, specifically `docs/scrapers.md`, which explains how our scrapers work and how they are used within the system.

### Outcomes
The AI produced a clear, structured documentation draft covering the scraper purpose, usage, and workflow. This served as a strong starting point and was refined to better reflect the project's implementation.

### Reflections on Usefulness
Claude Code was effective for quickly producing readable documentation and reducing the effort required to explain existing code. It could be useful for maintaining documentation as the project evolves.

### Ensuring Correctness, Clarity, and Fair Use
I reviewed the generated documentation against the actual scraper code to ensure accuracy and made edits where necessary. The AI output was treated as a draft and revised to ensure correctness, clarity, and appropriate use.

---

## Kyle Villeponteau

### Experiment Description
I used AI assistance to implement the "Browse All Listings" feature: a section that compiles listings from all property management companies and supports filtering by price, bedrooms, bathrooms, square footage, and source. The work included a new backend aggregate endpoint, a dedicated frontend section with filter controls, and small updates to shared listing components.

### Outcomes
The AI produced a working end-to-end feature: a **`GET /scrape/all`** backend endpoint that runs all five scrapers in parallel and returns combined listings; a new **Browse All** section and header nav link that fetches from that endpoint; client-side filters (price min/max, bedrooms, bathrooms, sq ft min/max, and source chips); and shared UI updates so **ListingCard** shows square footage when present and **ListingList** accepts an optional `emptyMessage` prop for context-specific empty states.

### Reflections on Usefulness
The AI was effective for quickly scaffolding the backend aggregate logic, the React component with filter state, and the wiring in App and Header. It reduced the effort to implement a multi-scraper aggregate and a consistent filter UX in one pass.

### Ensuring Correctness, Clarity, and Fair Use
The generated code was reviewed and adjusted for correctness (e.g., filter logic, empty states, and API response shape). The AI output was treated as a draft and refined to match the existing codebase style and to document the changes in this file.
