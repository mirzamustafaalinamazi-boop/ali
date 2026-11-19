# OTD engineering demonstration

## Implemented
- Responsive static PWA with original garment SVG illustrations, browsing/search/filter, product sizes, outlet stock statuses and favorites.
- On-device saved looks, wardrobe, inventory editor, coupon claim and simulated redemption. Browser storage only, **no shared backend mutations**.
- Node development server and read-only Vercel serverless routes: GET /api/health, GET /api/catalog, POST /api/recommend.
- Transparent rule-based outfit recommendations: budget, occasion, style, sizes, available demonstration stock; not a trained ML model.
- Node automated tests for stock precision, stale data, recommendation budget, CSV and duplicate redemption behavior.

## Architecture (demo)
Mobile browser -> static PWA + localStorage
Mobile browser -> read-only API -> fictional catalog / deterministic rule scoring

## Production-gated design (NOT IMPLEMENTED)
Use real Postgres tables for merchants, outlets, products, variants, inventory, inventory events, offers, coupon claims/redemptions, user profiles, wardrobe, saved looks and audit events. Add authenticated merchant roles, per-tenant authorization and RLS. Server-side idempotent coupon transactions, stock ledgers, image rights, monitoring and recovery need independent implementation and tests. No checkout until legal seller, invoicing, shipping and refunds are resolved.

## Honest status
Code-level features and automation tests are implemented; production authorization, persistent backend data and trained ML are not. Fictional merchant names/addresses must not be represented as real partner stores.
