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

---

## Alex Jeong

### Experiment Description
I used ChatGPT to generate unit tests for the ListingCard React component. The goal was to evaluate how effectively AI could produce meaningful frontend test coverage for formatting logic and conditional rendering, such as price formatting, square footage rendering, and link rendering. The experiment focused on generating a complete test suite using React Testing Library and integrating it into our Vite-based project using Vitest.

### Outcomes
The AI produced a full ListingCard.test.jsx file containing multiple test cases covering standard rendering, null/undefined handling, the “Studio” bedroom case, square footage formatting, and conditional link behavior. After installing Vitest and configuring the Vite test environment (jsdom), the tests executed successfully. Minor adjustments were required to align exact expected text values with the component’s formatting logic.

### Reflections on Usefulness
The AI was effective at quickly scaffolding a comprehensive test structure, including realistic mock data and relevant edge cases. It significantly reduced the time required to write repetitive test boilerplate and helped ensure that multiple conditional paths were covered.

This approach could be useful for expanding test coverage across other components and for accelerating frontend testing when introducing new UI features.

### Ensuring Correctness, Clarity, and Fair Use
The generated test code was manually reviewed and executed locally using Vitest to confirm correctness. Each assertion was verified against the actual component behavior to ensure accuracy. Adjustments were made where expected values did not exactly match the implemented formatting logic.

---

## Timothy Nguyen

## Experiment Description
I used Claude (Anthropic) to systematically add listing URL functionality across multiple web scrapers for different property management companies. The task involved updating scraper Python files (Wolfe & Associates, Solis, PlayaLife, Meridian, and Koto) to extract and return listing URLs that link to the original property pages. This required modifying both the backend scrapers to capture URLs and ensuring the data structure matched the frontend expectations.

## Outcomes
The AI successfully updated five scraper files to include listing_link extraction logic. Each scraper was modified to locate the appropriate HTML anchor elements, extract the href attributes, convert relative URLs to absolute URLs, and return the URL in a consistent data structure. The frontend ListingCard component was already configured to display these links, so once the scrapers were updated, all listings became clickable and linked to their source pages.

## Reflections on Usefulness
Claude was extremely effective for this repetitive but critical task. The AI quickly identified the pattern needed across different scrapers, adapted to each scraper's unique HTML structure, and maintained consistency in the field naming (listing_link). This approach significantly accelerated development compared to manually updating each scraper, and the iterative debugging process helped catch issues with field naming mismatches between frontend and backend.
This workflow could be highly useful for future scraper additions or updates, especially when maintaining consistency across multiple similar code files.

## Ensuring Correctness, Clarity, and Fair Use
Each generated scraper file was tested locally by running the backend server and checking the API responses to verify that listing_link fields were present and contained valid URLs. The frontend was tested in the browser to confirm that listing addresses were properly rendered as clickable links. The AI output was reviewed line-by-line to ensure the URL extraction logic was appropriate for each site's HTML structure, and adjustments were made when selectors needed refinement.

