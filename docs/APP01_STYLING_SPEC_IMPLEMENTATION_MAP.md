# OTD-APP-01 / Integration Map for the 21 November 2026 Styling App Codex Spec

**Scope:** `mirzamustafaalinamazi-boop/ali` investor-demo repository only. **Feature branch:** `feature/otd-app01-spec-p0-wardrobe-integrity`. This is NOT a certified native app, production cloud account service or integrated AI model.

**Source:** user-supplied `01_OTD_Styling_App_Codex_Build_Spec(1).docx` (12 pages, version 1.0 dated 21 November 2026). Preserve P0/P1/P2 labels from the source. The supplied 20 capability IDs are requirements; source code presence is not a production acceptance test. This map supplements the previous OTD v3.1 handout and the longer team application repo; it does not replace either.

## Implementation receipt: newly coded in this branch

- `public/wardrobe-integrity.js`: stable **wardrobe** source IDs and user-review provenance on styling candidates; separate constants for `wardrobe` and `commerce`; check confirmed/not-deleted/not-archived IDs; detect and flag saved looks invalidated by a removed garment; complete user-initiated local export bundle.
- `public/closet-engine.js`: deterministic rules remain the fallback; recommendation returns structured `items` with `source=wardrobe`, `stable_id`, `wardrobeItemId`, explanation and provenance. **Missing footwear now triggers an explicit partial look**, rather than implying the outfit is complete. Never invent shoe IDs.
- `public/consumer-ui.js`: gallery/camera file chooser without camera-only capture; ability to save unconfirmed **drafts** and explicitly confirm ownership later; planner excludes unrelated commerce demo looks, disables invalidated looks, shows a needs-review warning and removes the correct underlying event even after date sorting.
- `public/local-media.js`: browser-only image decode, bound resize (1100px long edge), JPEG re-encode to avoid persisting source EXIF, and file-type/size/converted-size constraints. **No server upload**, guaranteed security scanning, professional image fidelity or production private bucket.
- `public/app.js`: connects form, photo processing, source provenance, safe look saving, reconciliation after wardrobe deletion, local export privacy warning, local-photo reset. Legacy functionality retained.
- `public/photo-preview.js`: ephemeral photo collage session is reset when users delete their local prototype data.
- `tests/app01-p0.test.js`: acceptance tests for confirmed ownership, deleting garment, missing footwear, provenance, draft/gallery UI, bounds, local export and planner behavior. Existing historic saree test updated to treat missing shoes as a partial outfit.
- `.github/workflows/ci.yml`: requires the existing Avatar Studio's pinned build assets **before** running its HTTP route integration test (the main-branch CI previously failed because `/avatar-studio/` had not been built in CI). Confirm result from Actions; never claim success without a green run.
- PWA caching and syntax validation include new modules.

**Release policy:** Do not merge or deploy until review approval, successful CI, actual browser walkthrough, and review of user data handling. No migration to production databases was run.

## A01–A20 source requirement coverage

| ID | Priority | Capability | Current integration verdict |
|---|---|---|---|
| A01 | P0 | Accounts and device sessions | **BLOCKED** — no verified server-side consumer authentication/account isolation in this demo; production IDP ADR required |
| A02 | P0 | Onboarding and Style DNA | **PARTIAL** — editable local preferences; consent, account onboarding, cross-device data missing |
| A03 | P0 | Closet CRUD and confirmation | **IMPROVED IN BRANCH** — manual add, optional local photo, draft, explicit confirmation, delete and local provenance; cloud CRUD/version conflict missing |
| A04 | P0 | Confirmed wardrobe-only styling | **IMPROVED IN BRANCH** — stable IDs, structured provenance, missing-footwear partial fallback; no server ranking yet |
| A05 | P0 | Saved looks and planner | **IMPROVED IN BRANCH** — saved look invalidation and corrected plan removal; still browser-only, no cross-device sync or locking workflow |
| A06 | P0 | Private photo media | **PARTIAL** — bounded metadata-stripped local import; no authenticated private object storage, signed URLs, backend quotas or scanning |
| A07 | P0 | Privacy/export/delete | **IMPROVED IN BRANCH** — local export warning and photo reset; account erasure jobs, verified receipts and legal retention not built |
| A08 | P0 | Accessible mobile | **PARTIAL** — responsive PWA with basic focus/reduced motion; no full mobile accessibility, slow-network or device matrix signoff |
| A09 | P1 | Contextual AI Stylist | **PARTIAL** — manual context and rule-based engine; no verified tool-using LLM, swaps/locks with safe server scopes |
| A10 | P1 | Real shopping catalogue | **NOT CONNECTED** — fictional catalog; real verified read-only commerce integration absent |
| A11 | P1 | Real-time weather | **NOT CONNECTED** — weather manually entered; no consented fresh weather API |
| A12 | P1 | Garment recognition | **NOT BUILT IN DEMO** — no benchmarked vision model |
| A13 | P1 | Background segmentation/tagging | **NOT BUILT** — local resizing != garment segmentation |
| A14 | P1 | Shop complete look | **NOT BUILT** — no verified seller stock/size checkout |
| A15 | P2 | 360° character avatar | **PROTOTYPE** — procedural WebGL and higher fidelity Avatar Studio source; precise fit and visual quality unverified; route-build CI gate pending |
| A16 | P2 | Optional user photo styling | **PROTOTYPE** — private manual 2D collage; no automated image-to-image try-on |
| A17 | P2 | Measured virtual fitting | **NOT BUILT** — no manufacturer-specific garment physics/size validation |
| A18 | P2 | Social/community/referrals | **NOT VERIFIED IN DEMO** — safety and privacy infrastructure missing |
| A19 | P2 | Premium digital plan | **NOT BUILT** — no store-verified entitlements |
| A20 | P2 | Private AI chat history | **NOT BUILT** — no provider-validated access, redaction, scoped chat deletion |

## Proposed architecture decisions (not adopted)

1. **ADR-APP01-IDENTITY**: choose hosted identity (OIDC/passkeys/password+verification), token lifetimes and multi-device/session policy, and establish customer-deletion behavior.
2. **ADR-APP01-DATA**: decide whether to reuse the team's Node/Express + MongoDB implementation or plan a tested PostgreSQL migration. The spec's proposed SQL tables do **not** authorize replacing an existing database without an approved ADR.
3. **ADR-APP01-MEDIA**: private object storage, short-lived signed URLs, malware/type scans, EXIF and derivative retention/deletion. Current client-local photo import is only a demo.
4. **ADR-APP01-AI**: choose actual vision provider(s), LLM tool calling limits, dataset evaluation, INR cost caps and failure fallback.
5. **ADR-APP01-MOBILE**: choose production Flutter versus PWA app client. Existing Flutter, web and demo sources are separate and must not be silently treated as one deployed application.
6. **ADR-APP01-COMMERCE**: read-only offer/variant contract with Stock Action/commerce backend, no direct POS/retailer credentials in consumer app.

## Next authorized engineering tickets (proposed, not performed)

- **APP-P0-01 Auth & tenant-isolation:** working signed-in staging account, user-scoped closet/photos, adversarial cross-account and expired-token tests. **Needs provider architecture decision and staging environment.**
- **APP-P0-02 Private closet API:** versioned garment CRUD, signed upload, draft/confirm, safe deletion, image purge and conflict handling; migrations and rollback. Staging-only.
- **APP-P0-03 Local-to-account migration:** preserve local garments and stable IDs, user-controlled import and consent, idempotent retry, exact source/provenance.
- **APP-P0-04 Saved look/plan API:** prevent references to deleted/unowned IDs, plan timezone and concurrency controls.
- **APP-P0-05 Privacy and deletion:** consent version/withdrawal, verified export and scheduled erasure job including derived photos/avatar outputs.
- **APP-P1-01** garment recognition & segmentation benchmark (first-class Indian wear), with editable review and UNKNOWN label handling.
- **APP-P1-02** tool-enabled stylist chat and location/venue/weather reasoning with explicit evidence sources and no invented garment IDs.
- **APP-P1-03** commerce connection: only active published variants and prices; no false claims of a physical store's stock.
- **APP-P2-01** high-fidelity avatar assets, garment reconstruction and real-person fit QA; never promise equivalence with physical garment fitting.

## Manual acceptance script for this PR

1. Start a clean copy of the app in a supported browser in the feature preview.
2. Open Closet, add an item without checking **confirmed**. It appears with **REVIEW** status and is excluded from Style.
3. Confirm the same garment. Add a bottom and run Style. It shows **PARTIAL** when footwear is missing; no shoe is invented.
4. Add confirmed shoes; generate and save a complete look. Inspect the exported JSON for `items[].source='wardrobe'` and stable garment IDs.
5. Plan that look on dates in non-chronological input order. Remove an entry after sorting and verify the intended date is removed.
6. Remove one garment and inspect Plan. The saved look must become **NEEDS REVIEW**; planning that invalid look must be blocked.
7. Add a camera/gallery image; confirm the browser-only file constraints and that no network request uploads it. Export local data after the privacy warning, then delete local data and verify photo collage session reset.
8. Open Avatar, check 2D fallback and higher-fidelity asset routes on a physical iPhone and Android browser.
9. Separately run CI: build avatar dependencies and assets, `npm test`, `npm run check` and check Action logs. Failed CI blocks release.

**Definition of Done remains unmet for full P0 beta** until real authenticated staging backend, authorized private media, audited deletion, device E2E, security tests and supervised pilot evidence are available.
