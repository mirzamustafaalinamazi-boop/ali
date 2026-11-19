# OTD — Outfit of the Day / Own The Day

**A mobile-first fashion discovery and styling demonstration for Hyderabad, India.** The first public iteration lets a visitor browse fictional clothing, filter by category, select a size and demo outlet, explore availability, create rule-based outfit recommendations, save wardrobes and looks, and test retailer inventory and coupon workflows. All data is fictional. **No live merchants, orders, payments, production auth, machine-learning model or shared persistent customer database exist.**

## Run locally

Node 20+ required. There are no external runtime dependencies.

```bash
npm test
npm run check
npm start
# Open http://localhost:3000
```

## Test on iPhone

Open the deployed HTTPS site in Safari. Tap Share → Add to Home Screen. This is an installable progressive web app (PWA), not a native App Store iPhone application. Demo wardrobe, favorites, coupon claims and stock changes are stored locally in that browser and are not synchronized between devices.

## REST endpoints

- `GET /api/health`: application status, clearly identifies demo mode
- `GET /api/catalog`: fictional products, demo stores/outlets and per-variant sample stock
- `POST /api/recommend`: transparent rule-based suggestions within budget/size constraints, `{"budget":7000,"occasion":"College","style":"Casual","size":"M","shoeSize":"40"}`

## Architecture

- `public/index.html`, `app.css`, `app.js`: mobile-first storefront and demo controls
- `public/data.js`: fictional merchant, product and per-outlet stock fixtures
- `public/styling.js`: shared rule-based ranking, stock/freshness, CSV and coupon-demo validation
- `public/art.js`: original SVG garment illustration generator
- `api/`: Vercel-compatible *read-only* catalog and recommendation endpoints
- `server.mjs`: zero-dependency Node local HTTP server
- `tests/`: Node built-in test suite
- `docs/ARCHITECTURE.md`: architecture and production security backlog
- `.github/workflows/ci.yml`: CI checks on PR and changes

### ECC workflow

The source follows the engineering practice of plan → tests → implement → review → verify → handoff inspired by the MIT-licensed [ECC repo](https://github.com/affaan-m/ECC). It does **not** install ECC's Claude-specific hooks or autonomous agents into ChatGPT.

## Next gated product phase

Use a real hosted database and authenticated merchant/consumer accounts; per-retailer row-level isolation; server-side atomic inventory and one-use coupon transactions; verifiable content/media rights; observability; privacy controls and performance/security testing. Real checkout requires business/legal/tax/payment design and independent QA. See `docs/ARCHITECTURE.md`.
