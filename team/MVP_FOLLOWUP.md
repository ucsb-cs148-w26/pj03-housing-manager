# MVP Follow-Up

## Feedback Grouped and Sorted

### High Priority
1. **Database & Caching** - Users shouldn't wait for live scraping; implement background scraping with database storage
2. **Listing Images** - Add property images to listings (many scrapers already capture image URLs)
3. **Filtering & Sorting** - Add filters for price, bedrooms, bathrooms, location, availability dates
4. **Listing URLs** - ✅ COMPLETED - All scrapers now return clickable listing links

### Medium Priority
5. **Reviews & Ratings** - Allow users to rate property managers and housing companies
6. **Roommate Finder** - Social feature to help students find roommates and form groups
7. **Contact/Messaging** - Enable direct messaging between sublease posters and interested renters
8. **Map Integration** - Visual map showing listing locations and proximity to campus

### Low Priority
9. **More Property Companies** - Expand scraper coverage beyond current 5 companies
10. **Notifications** - Alert users when new listings match their preferences
11. **UI Improvements** - Dark mode, accessibility features, mobile optimization
12. **Detailed Property Pages** - Show utilities, amenities, lease terms in dedicated pages

## Response Actions

### Sprint 1 (Next 2 Weeks)
**User Story 1:** As a user, I want to see property images so I can evaluate listings visually
- Update scrapers to capture `image_url` field (extend existing URL work)
- Update frontend `ListingCard` to display images
- Fallback to placeholder if no image available

**User Story 2:** As a user, I want to filter listings by price and bedrooms so I can find suitable options quickly
- Add filter controls to Browse All page (price min/max, bedrooms, bathrooms)
- Implement client-side filtering logic
- Add "Clear Filters" button

**User Story 3:** As a developer, I want listings stored in a database so scraping doesn't slow down users
- Set up PostgreSQL database
- Create listings table schema
- Implement background scraper job (runs every 6 hours)
- Update API endpoints to query database instead of live scraping

### Sprint 2 (Future)
- Reviews/ratings system with moderation
- Roommate finder feature
- In-app messaging for subleases
- Map view integration

## Next Steps

1. **Immediate (This Week)**
   - Begin database setup and schema design
   - Start implementing image display (quick win)
   - Add basic price/bedroom filters

2. **Sprint Planning**
   - Prioritize database migration (biggest performance gain)
   - Assign image scraping updates across team members
   - Design filter UI mockups

3. **Technical Decisions Needed**
   - Database: PostgreSQL vs MySQL?
   - Background jobs: Celery vs simple cron job?
   - Image hosting: Store locally vs CDN?
   - Scraping frequency: Every 6 hours? Daily?

4. **Questions to Address**
   - How to handle review moderation?
   - Should we partner with property management companies directly?
   - OAuth implementation timeline for UCSB email verification?