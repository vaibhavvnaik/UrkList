# Issue #1 QA Checklist: Newsletter Detail Uses Clickable HTML

## Scope
Validate that listing detail view renders newsletter HTML/markup with working links, preserves layout, and handles missing HTML gracefully.

## Preconditions
- App is running locally.
- Test data includes listings for all 3 cases:
  - `Case A`: `htmlContent` contains inline HTML.
  - `Case B`: `htmlContent` is empty, `content` is a remote HTML URL (not an image).
  - `Case C`: Neither `htmlContent` nor `content` provides renderable HTML.

## Test Matrix

### 1. Case A: Inline HTML (`htmlContent`)
- Open listing tile for `Case A`.
- Confirm detail view renders full newsletter inside the framed content area.
- Click 3+ links in the email body (including any affiliate/tracking links if present).
- Verify links open and URLs preserve original query params/tracking values.
- Verify visual structure resembles original newsletter (sections, spacing, fonts, CTA blocks).

Expected:
- HTML is rendered (not static image).
- Links are clickable and functional.
- No obvious layout break in container.

### 2. Case B: Remote HTML URL (`content`)
- Open listing tile for `Case B`.
- Confirm newsletter renders in the same detail container.
- Click at least 2 links in rendered newsletter.
- Verify links open correctly and preserve full original destination URL.

Expected:
- Remote HTML loads in iframe.
- Links remain clickable.
- No image-based fallback shown.

### 3. Case C: Missing/Unavailable HTML
- Open listing tile for `Case C`.
- Confirm warning copy appears in detail content area.
- Confirm no newsletter screenshot/image is shown.
- If brand `siteURL` exists, click "Shop at {Brand}" CTA.

Expected:
- Clear warning that original newsletter HTML is unavailable.
- Graceful fallback UI only (no broken image).
- Brand CTA still works when available.

### 4. Regression: Detail Header + Promo Block
- For one listing with promo codes, verify promo code copy interaction still works.
- Verify back button, brand link, heart button, and timestamp still render and function.

Expected:
- Existing detail-page controls behave unchanged.

## Pass Criteria
- All scenarios match expected outcomes.
- No detail view renders newsletter content as a static screenshot when HTML is available.
- Link behavior remains intact for affiliate/tracking URLs.
