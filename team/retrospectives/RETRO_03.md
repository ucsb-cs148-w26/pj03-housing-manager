# Date of Retrospective: 02/27/26

* Led by: Nathan Mitter  
* Present: Everyone is here

## Action item

* **Goal:**  
  Ship a stable, demo-ready build by tightening up last-mile UX (especially around login/admin flows), reducing regressions, and making sure everyone knows what “done” means before we merge.

* **Change / Experiment:**  
  Introduce a **“Definition of Done + Demo Check”** workflow:
  - Every task card must include **3 bullets** before moving to *In Review*: (1) acceptance criteria, (2) test notes (how you verified it), (3) demo note (how to show it in <30 seconds).
  - Add a **15-minute “demo desk check”** twice this week (mid-week + day before showcase) where we run the happy path live and log any issues as new cards.

* **Measurement:**  
  - Fewer “it works on my machine” moments (tracked by review comments / reopened PRs)  
  - Reduced bug count discovered during demo practice  
  - Faster reviews due to clearer acceptance criteria + verification steps

---

## Retro Assessment

* **Retro process used:**  
  We used a **Start / Stop / Continue** retrospective format, then did a quick dot-vote to pick one experiment everyone can commit to.

* **Assessment of how it went:**  
  The retro was focused and practical. People were candid about where time got burned (unclear requirements, surprise merge conflicts, last-minute bug hunts), and we stayed solution-oriented instead of blame-oriented.

* **Advice for the next retro leader:**  
  Come prepared with 2–3 concrete options for a team experiment so the group can choose quickly, and leave time at the end to assign owners + dates (otherwise the experiment stays theoretical).

---

## Experiment / Change

* **Description of the change / experiment:**  
  We piloted **Definition of Done + Demo Check** on all cards touched this week, and scheduled two short demo rehearsals where someone not involved in the feature tries the flow end-to-end.

* **Assessment of results:**  
  - Review cycles became noticeably smoother: fewer back-and-forth comments asking “what was the intended behavior?” because cards already had acceptance criteria.  
  - Demo rehearsals caught multiple issues earlier than usual (one permissions edge case, one broken navigation path, and one styling regression) before they became “showstopper” surprises.  
  - Team confidence improved: by the second demo check, the happy path felt consistent and repeatable, and we spent less time scrambling right before merging.

* **Decision going forward:**  
  Keep the change, with one tweak: if a card is truly tiny, the **demo note can be a single sentence**, but it still must exist. Continue doing demo checks during high-stakes weeks (deliverables, showcases, releases), and revisit frequency once the product stabilizes.
