You are working in repository vaibhavvnaik/urk.

Primary objective:
Resolve GitHub issue #1 with a focused, production-safe change set.

Issue metadata:
- Number: #1
- Title: Fix newsletter tiles: Ensure detailed view preserves clickable links instead of images
- Prepared at: 2026-03-08T05:02:46Z
- Branch: fix/1-fix-newsletter-tiles-ensure-detailed-view-preser

Hard constraints:
- Use this branch only for this issue.
- Keep scope limited to this issue.
- If unrelated bugs are found, mention them in PR notes but do not fix in this branch.
- Update tests/docs only if behavior or setup changes.

Issue body:
**Problem:**
Urklist.com currently displays newsletter details in the detailed view as images for many listings. This causes an issue where newsletter content loses its original clickable links, which are needed for potential affiliate monetization.

**Why this matters:**
- Original links are not preserved when the newsletter is converted into an image.
- Clickable links are essential for tracking clicks and earning affiliate kickbacks.

**Requirements:**
- Maintain the current look and structure of the newsletter detailed view.
- Display the newsletter details as HTML/markup with all original links preserved and working.
- Do not disrupt the layout/appearance of the detailed view.
- Ensure any affiliate or tracking links remain intact when shown to users.

**Acceptance Criteria:**
- When a user clicks on a tile, the detailed newsletter view should always show the full, original newsletter with all clickable links, not an image.
- There should be no loss of style or structural fidelity compared to the previous image-based approach.
- Test with multiple listings covering different newsletter formats.

**Additional Notes:**
- Please check if there are newsletters where fetching the original HTML is not possible, and handle those cases gracefully (e.g., show a warning or fallback).
