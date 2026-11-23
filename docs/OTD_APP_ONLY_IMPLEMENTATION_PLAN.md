# OTD consumer app only — implementation plan (2026-11-21)

**Status:** approved scoping proposal for review; not a claim of production readiness.  
**Specification source:** user-provided `01_OTD_Styling_App_Codex_Build_Spec.docx` (OTD-APP-01 v1.0, 12 pages).  
**Product:** Outfit of the Day — wardrobe-first consumer fashion app.

## Mandatory product boundary

The consumer app contains personal Style DNA, private Digital Closet, gallery/camera uploads, context-aware outfit recommendations, stylist chatbot, saved looks/planner, optional style book, hairstyle and accessory suggestions, and user-controlled avatar.

**Do not add retailer inventory, POS, ERP, merchant administration, stock adjustment, coupon redemption, merchant onboarding, seller-facing dashboards or transactions to the consumer UI or consumer app APIs.** Existing fictional retail/admin demo routes may continue to exist temporarily as separately labeled prototype tools; removal from visible navigation is not a security boundary. Any real admin route needs authentication or separate deployment before production. The only permissible future connection is an optional read-only published-product suggestions service with explicit **NOT OWNED** labeling.

## Current repository state — evidence-limited

| Area | Evidence from existing sources | Production readiness |
|---|---|---|
| Consumer screens | `public/index.html`, `public/consumer-ui.js`, `public/app.js` | Browser/PWA prototype |
| Wardrobe | Local entry/photo, user confirmation | Cloud isolation unbuilt |
| Outfit engine | `public/closet-engine.js`; rule-based, confirmed garments only | No trained model |
| Style DNA and saved plans | Local browser state | Cross-device sync unbuilt |
| Photo styling | `public/photo-preview.js`, `docs/PHOTO_STYLING.md` | Manual collage, not try-on |
| 3D avatar | `public/avatar3d-*.js`, `docs/AVATAR_3D_ROADMAP.md` | Illustrative WebGL beta |
| Image recognition/full-outfit segmentation | Not implemented per `docs/V31_IMPLEMENTATION_STATUS.md` | Build and benchmark |
| AI chatbot | Not implemented per `docs/V31_IMPLEMENTATION_STATUS.md` | Build guarded service |
| Live venue/weather | Manual context only | Build consented connectors |
| Accounts / native app | No certified backend or Android/iOS binaries | Separate release gate |

## Roadmap, corresponding to uploaded A01–A20

### Foundation / P0

- A01 Identity, verified sign-in and safe sessions (server-side).
- A02 Editable onboarding / Style DNA, skip sensitive inputs.
- A03 Private Digital Closet CRUD, user-confirmed garments.
- A04 Rule-based wardrobe-only outfit engine; never invent owned clothes.
- A05 Save, swap, lock, calendar/plan with user-owned stable IDs.
- A06 Private media handling, safe uploads, short-lived delivery.
- A07 Export/delete/privacy permissions and real erasure jobs.
- A08 Accessible Android/iOS-compatible interface and offline/retry states.

**Consumer priority extension:** gallery-first multi-photo import of outfits users already wore. Camera is optional. If vision recognition is not ready, offer **manual crop/tag/confirm**; never misleadingly call it automatic AI extraction.

### Intelligence / P1

- A09 Context-aware stylist and controlled conversational requests.
- A11 Consented live weather with source and observation timestamp.
- A12 Garment classification with confidence and human review.
- A13 Non-destructive garment cutout, crop and editable tags.
- Worn-outfit extraction: multi-garment segmentation, duplicate detection, mixed Indian/Western taxonomy.
- Chatbot: intents for outfit creation, keeping one item, swapping footwear, adding accessories, explaining reasons and saving; all outputs validated to owned IDs.
- Location intelligence: city/venue search, disambiguation, real weather/venue facts when documented, manual fallback and user override.
- Style Book: Style DNA, saved looks, accessories, colour harmony, occasion templates, hair ideas, capsules/travel.
- Hairstyle advice: opt-in editable preferences; no inferred sensitive attributes or beauty scoring.

### Advanced / P2

- A15 Procedural character/avatar 360° preview with 2D fallback; optimise assets, benchmark mobile GPU.
- A16 Opt-in photo styling; do not claim accurate fit.
- A17 Size/fit validation only after independently verified garment measurements/brand data and quality testing.
- A18 Social/community only with explicit sharing, moderation/reporting and private-by-default wardrobes.
- A19 Digital premium plan only after payment-provider entitlement verification, current store-policy review and cost modelling.
- A20 AI conversation history only with scoped retention and deletion.

### Strictly optional cross-product reference

- A10 and A14 from the original source ("real catalogue" and "shop complete look") are **outside the core app release**, except for an optional read-only shopping suggestion link. They do not authorize stock editing, merchant accounts, checkouts or seller inventory dependencies in the consumer MVP.

## Required backend contracts (proposals, ADR approval required)

`/v1/me`, `/v1/me/style`, `/v1/media/upload-intents`, `/v1/outfit-uploads`, `/v1/extractions/{id}/candidates`, `/v1/extractions/{id}/confirm`, `/v1/wardrobe`, `/v1/wardrobe/{id}`, `/v1/style/recommend`, `/v1/stylist/messages`, `/v1/venues/resolve`, `/v1/weather`, `/v1/looks`, `/v1/plans`, `/v1/style-book`, `/v1/account/export`, `/v1/account/delete`.

Required server invariant: **the API must reject any look/chat recommendation that references a garment ID not confirmed as owned by the authenticated user.**

## Release checklist

1. Collect baseline SHA, tests, `AGENTS.md`, run scripts and deployed screenshot evidence.
2. Write ADRs for identity, media, database, AI provider, background workers, native runtime, venue/weather provider and consent.
3. Define schemas, request/response contracts, error states and migration plan.
4. Write tests first for cross-user access, photo jobs, AI uncertainty, wardrobe-only outputs, chat swap locking, consent and deletion.
5. Implement on isolated branches and feature flags; use staging secrets only.
6. Measure latency, INR/model cost, crash rate, garment benchmark accuracy and user recommendation usefulness on real devices.
7. Review security, privacy, accessibility, data ownership, backup/recovery and incident response.
8. Generate signed Android AAB, iOS/TestFlight build and required store metadata **only after approved mobile runtime and QA**.
9. Release to controlled beta; do not describe any preview as photorealistic fitting without validated proof.

## Repo change in this PR

- Remove retailer inventory/internal admin shortcuts from the **consumer** page navigation, while leaving separate demo routes untouched for future migration.
- Replace prominent shopping-demo marketing action with a limited, clearly described future-shopping note.
- Add boundary tests. These changes do not themselves establish secure production access controls.

## Definition of done

A test user can register; import or manually add worn outfit garments; confirm the extracted/entered pieces; get a wardrobe-only outfit recommendation; ask the assistant for a specific change; save/plan the resulting look; use 2D fallback if avatar fails; export and delete their own data — with documented API and real-device evidence, **without any retailer inventory or POS workflow in the consumer app**.

**Stop conditions:** data leakage, unjustified AI claims, fabricated wardrobe item IDs, unapproved personal-photo sharing, missing irreversible-deletion controls, failed owner isolation, destructive migrations without rollback, or failed required QA.
