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

---

## Nathan Mitter

## Experiment Description

I used GitHub Copilot to design and implement a complete commenting system for a React-based sublease listing component. The goal was to evaluate how effectively AI could assist in developing a full-stack feature—from requirements gathering through implementation—including state management, event handling, CSS styling, accessibility features, and comprehensive project documentation. The experiment focused on creating a collapsible comment interface with CRUD operations (Create, Read, Delete) while maintaining code quality, following React best practices, and generating production-ready documentation including user stories, acceptance criteria, and GitHub issue/PR templates.

## Outcomes

The AI produced a complete feature implementation consisting of:
- **Enhanced React Component** (`SubleaseListings.jsx`): Added 3 new state hooks (`expandedComments`, `commentForms`, `comments`), 4 handler functions (`toggleComments`, `handleCommentChange`, `handleCommentSubmit`, `deleteComment`), and comprehensive JSX for the comment UI with accessibility attributes and test IDs
- **Complete Styling** (`SubleaseListings.css`): 15 new CSS classes, 2 keyframe animations (`slideDown`, `fadeIn`), and responsive hover states
- **Production Documentation**: 11 detailed acceptance criteria with line-by-line code verification, a complete GitHub issue template formatted for Kanban boards, and a comprehensive PR description following best practices

The implementation required no corrections to the core logic. All state management patterns followed React conventions, the conditional rendering logic was sound, and the CSS animations performed as expected. The code included defensive programming practices (null coalescing with `comments[post.id] || []`, input validation with `.trim()`) without explicit prompting.

## Reflections on Usefulness

The AI excelled at several aspects of the development process:

1. **Requirements Translation**: Transformed a simple request ("add commenting functionality") into a structured feature with proper user stories and testable acceptance criteria
2. **State Architecture**: Designed an appropriate state management strategy using object-keyed state (`{postId: data}`) to handle per-listing comments independently
3. **Edge Case Handling**: Proactively included validation for empty comments, null safety for comment arrays, and conditional rendering for empty states
4. **Accessibility First**: Integrated ARIA attributes (`aria-expanded`, `aria-label`) and semantic HTML without being explicitly asked
5. **Documentation Quality**: Generated acceptance criteria with specific line number references to verify implementation, making code review significantly more efficient
6. **Visual Polish**: Created cohesive animations and hover states that matched the existing design system

The most valuable aspect was the **verification mappings** in the acceptance criteria—each criterion included exact line numbers and code snippets proving implementation, which would accelerate PR reviews and QA testing.

This approach could be particularly useful for:
- Rapidly prototyping new features with complete documentation
- Ensuring accessibility requirements are considered from the start
- Creating onboarding materials for new team members (the acceptance criteria serve as inline documentation)
- Generating standardized issue/PR templates that maintain consistency across a team

## Ensuring Correctness, Clarity, and Fair Use

**Correctness Verification:**
- The generated code was analyzed for React anti-patterns (none found—proper use of controlled components, no direct state mutation, correct dependency management)
- State update logic was traced through to confirm immutability (`...comments, [postId]: [...]` spread patterns)
- Event handler signatures were verified against React synthetic event types
- CSS syntax was validated for browser compatibility (animations use standard properties, no vendor prefixes needed for target browsers)
- Accessibility attributes were cross-referenced with ARIA specifications to ensure proper usage

**Manual Adjustments Made:**
- No functional code changes were required
- The generated code was production-ready as-delivered

**Clarity Enhancements:**
- The AI proactively added `data-testid` attributes anticipating future automated testing needs
- Comment structure included descriptive section headers in CSS
- Function names followed clear naming conventions (`handleCommentSubmit` vs. generic `onSubmit`)

**Fair Use Considerations:**
- The implementation follows standard React patterns documented in official React and React Testing Library documentation
- CSS animations use common web animation techniques
- No proprietary or licensed code patterns were replicated
- The code represents a common UI pattern (collapsible comments) implemented with standard technologies

**Limitations Identified:**
- Comments persist only in client-side state (no backend integration)
- The hardcoded username (`'SexyJesusFreak'`) should be replaced with actual authentication context
- No input sanitization for XSS prevention (would be needed before production deployment)
- Comment timestamp uses `toLocaleString()` which may cause inconsistencies across locales

**Validation Process:**
The generated acceptance criteria with line-number verification served as a built-in checklist for correctness validation. Each of the 11 criteria was manually verified against the code, and all passed without modification. This self-documenting approach significantly reduced the review burden compared to traditional code review processes.

## Conclusion

This experiment demonstrated that AI-assisted development can successfully handle complex feature implementation when the task involves well-established patterns (React state management, CSS animations, accessibility best practices). The AI's ability to generate comprehensive documentation alongside code—particularly the verification-mapped acceptance criteria—represents a significant productivity enhancement for development workflows. Future experiments should explore integration with backend systems, authentication context, and automated test generation to complement the manual test IDs included in this implementation.

---

## Jeffrey Keem

### Experiment Description
I used AI to implement a dark and light mode toggle for the web app. The task involved adding theme state management, creating a toggle component, updating styles to support both dark and light themes, and ensuring the UI updated dynamically based on user selection. The AI generated and integrated the necessary frontend logic and styling changes, handling both the functional implementation and UI adjustments.

### Outcomes
The AI successfully implemented a working dark and light mode toggle. It added the required state management, connected the toggle to the application layout, and updated the styling to properly reflect each theme. The toggle allowed users to switch between themes seamlessly, and the selected mode persisted during usage. The implementation was completed with no manual intervention.

### Reflections on Usefulness
The AI was highly effective for this feature implementation. It handled both the logic and styling updates efficiently, reducing development time compared to implementing the feature manually. Because dark/light mode requires coordinated changes across components and styles, having the AI generate and integrate the necessary updates ensured consistency throughout the application. This approach would be especially useful for similar UI enhancements or frontend features in the future.

### Ensuring Correctness, Clarity, and Fair Use
The implementation was tested by running the application locally and verifying that the toggle correctly switched between dark and light themes across all relevant components. UI behavior was checked to ensure styles updated consistently and no elements were visually broken in either mode. The generated code was reviewed to confirm clarity, maintainability, and proper separation of concerns before final integration.