# Stock Action by OTD — Retail + E-commerce prototype handoff
Updated 19 November 2026. Source: Noorkhan Bazaar 5 conversation and subsequent founder instructions.
Status: **LIVE STATIC BROWSER DEMO ONLY**, not a merchant-ready, securely authenticated, multi-device SaaS.

## Shipped in feature/stock-action-saas-demo

- Two explicitly selectable demo workspaces: `?workspace=owner` and `?workspace=cashier`, responsive for phone, tablet and counter desktop. Cashier navigation is limited to Sales Master, read-only inventory screen and storefront preview. **Role selector is not authentication**, and is deliberately labeled that way.
- SKU-based Code 128 label and matching `OTD:<SKU>` QR; camera scanning via browser BarcodeDetector or html5-qrcode fallback; keyboard/wedge barcode scanning; typed code fallback. Browser permissions and supported devices still require hands-on QA.
- A proper Sales Master: repeated scanning → cart quantities → payment method → receipt → same local inventory balance, movement ledger and reports. Cart enforces no overselling and checkout references prevent accidental duplicate transactions within a browser. Real server-side atomicity requires a database.
- Cash recorded with tender amount and calculated change; UPI with merchant-provided VPA, per-sale dynamic QR and manually entered transaction reference; Card with manually entered terminal authorization reference and optional last four digits. **No card number, PIN or CVV. No payment gateway connected.** UPI/card references remain **unverified**; a QR display alone never proves payment.
- Printed receipts display a transaction-linked QR. QR lookup checks only the browser-local sales record; it is **not** cryptographic proof, authentication of identity, or bank settlement verification.
- Owner profile demo stores owner-supplied store name and UPI VPA. Owner can save three compressed photos per SKU, choose minimal/editorial/classic presentation, explicitly approve or unpublish. Saving edits revokes prior approval. Photos and listing state remain in this browser only.
- Customer-facing Storefront uses the same product inventory object and lists only owner-approved, in-stock products with exactly three images. The feed excludes cost prices. The public page is an **embedded preview** — not a hosted external merchant storefront or live commerce API.
- New standalone testable engine and npm tests. The PR branch has CI covering QR normalization, cash/change validation, UPI and card references, receipts, publication authorization as business-logic demonstration, no-photo/3-photo gating and duplicate checkout. An additional test parses/checks the inline application module. The GitHub workflows give authoritative test status.

## Production system required before real merchant onboarding

1. **Merchant auth & tenancy**: Supabase/Auth0 or equivalent accounts; tenant IDs, owner/cashier membership, verified logins, short-lived sessions, staff invitations/revocations, tenant-scoped RLS, server-side role validation for ALL queries and mutations. Never derive access from a browser selector or editable JWT user_metadata.
2. **Atomic shared database**: Postgres tables for products, variants/barcodes, stock_balances, movements, sales, sale_lines, payments, receipts, owner approvals and immutable audit. The POS sale must lock stock (`FOR UPDATE`) and write sale, payment status, movement, balance and idempotency key in ONE transaction, or roll back all.
3. **Photographs**: private tenant-scoped object storage, MIME validation, file-size moderation, optimized CDN thumbnails after owner approval, secure URL lifetime; no base64 image blobs in browser localStorage for production.
4. **E-commerce sync**: owner-approved `channel_listings` & `listing_assets`, `GET /shops/:slug/catalog`, `GET /shops/:slug/products/:sku`, `POST /shops/:slug/orders/reserve`, webhook processing and order conversion. One common stock balance for in-person and online orders; reservations must expire safely and oversell must be prevented.
5. **Financial controls**: card payments via certified PSP/terminal, only token/reference/brand/last4 returned by provider; hosted payment page or terminal, not raw PCI data. UPI PSP signature-verified callback or reconciliation. Cash cashier shift closeout. Clear `pending/authorized/paid/failed/refunded` states and owner approval for refund/void. GST invoice settings only after retailer tax data/rules validated.
6. **Receipt QR integrity**: signed payload with version, sale ID, tenant ID, non-sensitive amount, issuance timestamp, HMAC/Ed25519 signature validated server-side. No merchant signature keys in a client JS bundle.
7. **QA**: test on iPhone Safari, Android Chrome, scanner hardware, print widths, offline/retry, concurrent two-cashier checkout, same-SKU multi-channel orders, returns, inventory restock, permissions, XSS/privacy/security. Use one tenant per merchant and staging data.
8. **Deployment**: configure authenticated Supabase project/org and Vercel secrets (no secrets in repo), run vetted migration + RLS advisor; stage, end-to-end test, then release. No Supabase project is currently accessible through connected account.

## Founder demonstration steps

Owner: `/?workspace=owner#products` → create SKU, preview QR label → E-commerce Sync → pick SKU, add three pictures, choose layout, publish → Storefront preview. To configure UPI: E-commerce Sync → set shop name and real merchant VPA.

Counter: `/?workspace=cashier#sales` → scan with camera/USB or type known SKU → add to cart → choose Cash/UPI/Card → record actual tender or a **manually entered** PSP/bank reference → print demo receipt. Look up `OTD-SALE:<sale-reference>` to find the local receipt; inspect stock and reports from owner view.

**Do not demo from two devices as if they share live stock. They do not. Do not accept real customer payments through this prototype.**
