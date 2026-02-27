# EVAL_RESPONSE.md

## Team Response to Peer Review (Lab08)

First, we would like to thank Team09 for the detailed and constructive feedback. We appreciate the time spent thoroughly reviewing our application and providing both positive comments and actionable suggestions.

---

## 1. Feedback Based on Our USER_FEEDBACK_NEEDS.md

### Metric 1: Overall User Satisfaction with Current Product

**Summary of feedback received:**
- Scores ranged from 5/10 to 7/10.
- Positive comments on: Clean and modern UI, Intuitive navigation, Filter system, Dark mode, Live scraping feature
- Areas for improvement: Listings not clickable, Missing property images, Bugs like Google login button persistance, Subleasing Feature Implementation, etc.

**Team Response:**

We are encouraged that multiple reviewers described the UI as intuitive and visually clean. This validates our effort toward layout clarity and usability.

However, we acknowledge the following critical issues:

- **Listings not clickable:** This was the most frequent comment. We agree that this significantly reduces the real-world usefulness of the product.
  - **Action:** Make listing cards clickable and redirect users to the original leasing website.

- **Missing images:** Images are essential for housing decisions.
  - **Action:** Investigate scraping and displaying listing images, or at minimum linking directly to image galleries.

- **Bug fixes:**
  - Fix conditional rendering so the Google login button disappears after login.
  - Resolve navbar wrapping issue (“Browse All” appearing on two lines).
  
- **Terminology update:**
  - Rename “Re-scraping” to “Refresh Listings” to make it more user-friendly.

- **Sublease feature issues:**
  - Start to implement the sublease or other social features.

---

### Metric 2: User Satisfaction with Listing Card Info in "Browse All"

**Summary of feedback received:**
- Scores ranged from 5/10 to 8/10.
- Filter system consistently praised.
- Strong requests for: Clickable cards, Images, Square footage display (filter exists but not shown), Sorting (price, bedrooms), Recommendation or rating system

**Team Response:**

We are pleased that the filtering system was consistently viewed as intuitive and effective.

However, we agree that the listing card itself lacks sufficient detail and interactivity.

**Action Items:**
- Make listing cards clickable.
- Display square footage if available from the source.
- Add sorting functionality (price ascending/descending, number of bedrooms).
- Explore implementing a basic recommendation heuristic (e.g., affordability-based ranking).

---

### Metric 3: Social Aspect of the Website

**Summary of feedback received:**
- Many reviewers did not clearly understand the current social component.
- Sublease feature appears incomplete or non-functional.
- Suggested improvements:Messaging between users, Group chats, Contact info posting, Real-time updates, Integration with landlord ratings

**Team Response:**

This feedback highlighted that our intended social component is currently underdeveloped and not clearly surfaced in the UI.

Currently, the sublease feature exists but lacks visibility and actual features.

We agree that the social component is not yet meaningfully implemented.

**Action Items:**
- Fix visibility and reliability of sublease posts.
- Clarify the purpose of the sublease feature in the UI.
- Scope a lightweight messaging feature if feasible within remaining time.
- Add optional contact information fields for sublease posts.
- Evaluate feasibility of linking to external landlord rating resources.

---

## 2. Summary of Features as Understood by Reviewers

Based on reviewer comments, Team09 understood the following core features:

- Live scraping of housing listings
- Aggregated “Browse All” listings page
- Filtering by housing attributes
- Dark mode
- Admin page
- Sublease feature (though incomplete)

**What they liked:**
- Clean UI
- Clear navigation bar
- Filter functionality
- Concept of aggregation
- Live scraping idea

**What they suggested improving:**
- Clickable listings
- Images
- Sorting
- Sublease robustness
- Minor UI bug fixes

We believe reviewers correctly understood our product’s intent. The main gap lies in incomplete implementation of some key features rather than confusion about our concept.

---

## 3. Effectiveness of Using the Product (Robustness & UI/UX)

**Feedback highlights:**
- UI described as modern and intuitive.
- Some features do not work (sublease).
- Google login UI bug.
- Admin page accessibility concern.
- Non-clickable listings significantly reduce usability.

**Team Reflection:**

The UI foundation is strong, but missing or incomplete interactions limit real-world effectiveness.

From a UX perspective:
- Housing decisions require photos.
- Users expect listings to redirect to the original source.
- Filters should align with visible listing information.

**Planned Improvements:**
1. Make listing cards clickable.
2. Add property images.
3. Fix login and navbar UI bugs.
4. Improve sublease reliability.
5. Add sorting and complete listing metadata display.

---

## 4. Deployment Instructions Feedback

There were no major concerns raised regarding deployment clarity.

However, we will re-review `DEPLOYMENT.md` for clarity and add necessary troubleshooting notes for environment varibles and dependencies.

---

## 5. Closing Thoughts from Reviewers & Our Reflection

**What reviewers liked most:**
- Clean UI
- Filtering system
- Live scraping concept
- Dark mode
- Structured layout

**Most impactful opportunity for improvement:**
- Making listings clickable and displaying images.

We strongly agree with this assessment. Without clickability and images, the app does not fully deliver its intended value.

**Additional positive notes:**
- Intuitive navigation
- Clear section organization

We appreciate this recognition, as we invested significant effort into UI consistency and usability.

---

## Final Team Reflection

We approached this review with openness and gratitude. While several areas require improvement, the feedback provides clear direction for strengthening our product before the end of the quarter.

We do not necessarily agree with implementing every suggested feature (e.g., full group chat may be out of scope), but we carefully considered each recommendation and documented our decisions.

Our top priorities moving forward are:

1. Make listing cards clickable.
2. Add property images.
3. Fix sublease visibility and reliability as well as adding a social aspect to the app.
4. Resolve UI bugs.
5. Improve sorting and listing completeness.

We thank Team09 for their thoughtful and constructive feedback.
