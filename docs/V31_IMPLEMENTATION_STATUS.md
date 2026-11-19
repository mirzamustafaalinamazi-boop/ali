# OTD v3.1 — investor demonstration alignment and delivery status

**Source of requirements:** `OTD_COMPLETE_APP_MASTER_HANDOUT_V3_1.pdf`, 8 pages, November 19, 2026. This document is a **proposed implementation blueprint**, not a record of completed software.

**Brand:** Outfit of the Day (consumer application) / Own The Day (parent identity). Tagline: **Your style. Every place.**

## Highest-level product decision

The **consumer wardrobe and styling experience is the primary application**. E-commerce and the retailer inventory management SaaS must remain separate surfaces and separately scoped engineering projects. Do not imply that a fictional retailer can manage real customer or inventory data from this demonstration.

## Brand specification (source-confirmed)

| Color | Exact code |
|---|---|
| Obsidian Espresso | `#1A120E` |
| Deep Cocoa | `#3A2418` |
| Burnished Brown | `#6B4A2E` |
| Warm Caramel | `#A88462` |
| Soft Champagne | `#D5C4AE` |
| Stone Charcoal | `#4A4A46` |

Typography proposed in source: Playfair Display for editorial headlines, Inter or PT Sans for text. Dark for premium hero moments; champagne and light backgrounds for reading. Motion subtle, reduced-motion responsive, labeled icon buttons.

The accepted creative reference is the user-provided OTD dress and men's formal-jacket hanger mark. In this PR, a compressed web rendering of the actual uploaded mark is in `public/otd-brand.js`.

## New v3.1 demo state

| Master requirement | Implementation in this feature branch | Evidence / limitations |
|---|---|---|
| HOME / CLOSET / STYLE / PLAN / PROFILE navigation | Implemented | `public/index.html`, `public/consumer-ui.js`, `public/app.js` |
| CREATE MY LOOK primary CTA | Implemented | Home → Style |
| Espresso/champagne branding | Implemented | `public/app.css` |
| Brand logo in header/home hero | Implemented | Optimized copy of uploaded image |
| Personal Style DNA preferences | Implemented | Editable, stored in browser only; no real cloud account |
| Digital Closet and garment taxonomy | Implemented as local manual tool | Garment name/category/color/fit/material; includes kurta, kurti, saree, lehenga and dupatta |
| Camera/gallery image selection | Implemented via device file input | Browser-local image only, limited size; no private remote media storage |
| Confirmation before styling | Implemented | User-reviewed garments enter recommendation engine |
| AI garment classification and full-outfit segmentation | NOT BUILT | Requires provider/vision model, benchmarking, background workers, consent and persistent user storage |
| Closet-grounded outfit suggestions | Implemented as deterministic proof | Combines only confirmed user-owned garments; never invents products |
| Destination, occasion, mood, weather, style | Implemented as manual brief | Weather is manually entered; no live weather inference |
| Partial outfit fallback | Implemented | Incomplete closet does not block suggestions |
| Outfit explanation and save | Implemented | Browser-only saved looks |
| Stylist chat / keep-item and swap flows | NOT BUILT | Needs interaction and recommendation state model |
| Calendar planning | Basic on-device preview | No reminders, sync, wear history or notification permissions |
| Data export and local reset | Implemented for browser demo | Real account export/delete API not present |
| Authentication / 8 proposed auth screens | NOT BUILT | Production auth and per-account segregation remain required |
| E-commerce and retailer SaaS | Retained as separate, labelled demo routes | Neither has real merchant accounts or live commerce |
| Privacy / tenant-isolated cloud database | NOT BUILT | Current sample data remains browser-local |
| Native mobile app / app-store distribution | NOT BUILT | HTTPS PWA may be added to home screen |
| Accessibility / performance / security certification | NOT VERIFIED | Automated core tests run; device and full security tests pending |

## 69-screen plan in source document

| Domain | Planned screens | Status |
|---|---:|---|
| Authentication | 8 | Product scope; real auth unavailable |
| Personalization | 10 | Style DNA preview, not complete flow |
| Digital Closet | 14 | Basic form, photo input and grid; extraction unavailable |
| Styling | 13 | Basic context form, wardrobe-only ranked looks, saving; chat/swap unavailable |
| Planning | 7 | Saved looks and local calendar, other features future |
| Future (social/commerce/try-on) | 9 | Future; not marketed as existing |
| Account | 8 | Editable preferences, browser-only export/delete; cloud account APIs unavailable |
| **Total planned** | **69** | **Not all implemented** |

## Proposed production architecture (not shipped)

Mobile client (React Native or Flutter, depending on validated team experience) → authenticated API → PostgreSQL → private object storage → background vision extraction/segmentation workers → wardrobe-grounded recommendation and stylist service → analytics/error monitoring.

Critical security properties:
- User and wardrobe ownership enforced server-side, media served through short-lived signed access where needed.
- Never expose AI model API keys or privileged database credentials in browser/mobile code.
- Image uploads require opt-in, size/type checks, safe storage, review, deletion and error/retry handling.
- Vision model predictions are suggestions until user confirms garments.
- Separate marketing/shopping consent from styling data.
- No unverified venue dress code, no fabricated wardrobe items, no claims of accurate fabric classification if image doesn't support it.

## Next engineering gates from source

0. Approve exact user flows, privacy decisions, source stack and responsibility ownership.
1. Benchmark garment recognition on labeled Indian/western wear images (category accuracy, extraction recall, latency and cost).
2. Implement secure persisted closet and review/correction flow, account isolation.
3. Extend stylist for context/weather, item locking, swaps, explanations and saved looks using actual wardrobe IDs.
4. Full QA (accessibility, privacy, security, performance, failure recovery).
5. Controlled beta and real pilot evidence; never substitute mock metrics for measured outcomes.

Proposed pilot targets in the handout are hypotheses only: onboarding >=70%, category accuracy >=90%, extraction recall >=85%, useful outfit feedback >=80%, crash-free sessions >=99.5%, zero successful unauthorized cross-account requests.

## Investor demo protocol

1. Open the Home tab and show the brand identity and the **CREATE MY LOOK** CTA.
2. On Closet, manually add and confirm a saree/kurti, matching bottom, and shoes (optional local photos).
3. On Style, enter a destination, occasion and weather (manual); generate real-owned-clothes suggestions.
4. Show partial outfit fallback when a garment category is missing.
5. Save a look; schedule it on Plan.
6. Edit Style DNA and export/delete local demo data under Profile.
7. Explain future AI garment extraction and secure cloud infrastructure honestly. **This is a visual, functional proof of the journey, not full production ML software.**

## Original developer review requirement

No data-backed investor claims, revenue, retention or ML accuracy have been measured as part of this commit. Do not fabricate these numbers for a pitch. All features remain subject to manual mobile Safari testing and product sign-off.
