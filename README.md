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


## OTD consumer experience — master handout v3.1 (November 19, 2026)

The investor demo's primary experience is now **wardrobe-first**, based on `OTD_COMPLETE_APP_MASTER_HANDOUT_V3_1.pdf`: **HOME / CLOSET / STYLE / PLAN / PROFILE**, with the core CTA **CREATE MY LOOK** and tagline **Your style. Every place.**

Implemented in the revised frontend:
- Header and hero use an optimized copy of the provided OTD dress-and-jacket logo.
- Exact six-color brand system: espresso `#1A120E`, cocoa `#3A2418`, burnished brown `#6B4A2E`, caramel `#A88462`, champagne `#D5C4AE`, charcoal `#4A4A46`.
- Editable Style DNA stored on this device.
- Digital closet of manually reviewed, confirmed user-owned garments; optional local camera/gallery photo; traditional Indian attire categories.
- Explainable outfit suggestions composed **only from confirmed garments** with partial-outfit fallback. Destination, occasion, mood, and **manually entered** weather.
- Save looks, plan them on a local calendar, and export/delete device-local demo data.
- Separate links to the fictional retail storefront and retailer SaaS demonstration.

**Important:** The 69 screens in the source handout are a planned inventory, not a claim that 69 working screens exist. No genuine AI photo extraction, segmentation, hosted user authentication, account-isolated database, real weather data, trained AI stylist, commerce or native app has been completed. For a precise implementation gap map and investor demonstration protocol, read `docs/V31_IMPLEMENTATION_STATUS.md`.

## Interactive 2D Avatar Studio (prototype)

The `#avatar` route now offers a customizable **illustrative 2D fashion avatar** based on user-selected skin tone, hairstyle, silhouette and selected *confirmed closet garments*. You can open it from Home or directly from the **VIEW ON AVATAR** button on an outfit recommendation, or preview saved looks. This is **not** trained virtual try-on, realistic body fitting, 3D cloth simulation or photo-based identity reconstruction. See `docs/AVATAR_STUDIO.md` for accurate capability boundaries.
