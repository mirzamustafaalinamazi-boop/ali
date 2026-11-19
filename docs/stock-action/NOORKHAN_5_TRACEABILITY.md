# Noorkhan Bazaar 5 — Implementation Traceability (19 Nov 2026)

Reference: uploaded Noorkhan_Bazaar_5_Transcription_and_Development_Brief(2).docx, eight pages. This is an edited meeting reconstruction, not independently verified verbatim audio transcription.

| ID / meeting requirement | Implemented in browser-local demo | Remaining for real shop |
|---|---|---|
| CAT-01 Add product | Variant form, SKU uniqueness, opening balance, private default | DB uniqueness, audit, brand/media/HSN; supplier barcode rules |
| Barcode create / lookup | SKU-based code; barcode preview via online JsBarcode dependency; existing SKU lookup by keyboard scanner | Camera scan support, verified physical scanner/label tests, full Code128 compatibility |
| POS-01 New Sale | Sales Master cart, quantity aggregation and stock check, Cash/UPI/Card simulated tender | Server ACID transaction, payment integrations, taxes, discounts, refunds |
| POS-01 Receipt | Unique demo receipt number, browser print, reprint transaction | Real numbered receipt database, printer hardware, GST determination |
| SAL-02 Sales | Today/week/month transaction count & amount and category breakdown | Multi-store reports, returns/discount/tax reconciliation |
| INV-02 Stock ledger | Demo sale and goods receipt change SKU qty and append movement with reference, before, after | Immutable ACID ledger, multi-location, concurrency control |
| PUR-01 Purchases | Owner mode goods inward, supplier, duplicate GRN guard | Enforced server RBAC, purchase orders, approvals, partial GRNs |
| DEV-01 Devices | Responsive browser interface for desktop and iPhone | Verified scanning/printing hardware, offline strategy, PWA installer |
| Owner/counter | Simulated owner/cashier selector; purchase UI hidden from cashier | Authentication, session handling, tenant membership and server-side authorization |
| Separate attendant app | Excluded, per meeting decision | No action |
| AI styling | Earlier rule-based demo retained | Actual model/embeddings, grounded evaluation |
| Ecommerce | Earlier published-catalog preview retained | Checkout payments, logistics, returns |

## Test traceability
- AT-01/02: automated product save and SKU lookup; physical barcode scanning NOT RUN
- AT-03: automated cart quantity merge
- AT-04/05: automated sale receipt ID, movement, stock deduction; browser print NOT RUN
- AT-06/07: automated today/week/month consistency
- AT-08/09: owner/cashier demo engine guard; API authorization NOT RUN
- AT-10/11/12: duplicate reference, insufficient stock and no false receipt in demo engine; distributed requests NOT RUN
- AT-13: responsive CSS authored; real iPhone/counter device NOT RUN
- AT-14: scanner and printer hardware NOT RUN
- AT-15: void/refund NOT IMPLEMENTED

## High priority production blockers
1. Authenticated, account-isolated PostgreSQL service, properly scoped RLS, and role-checked API.
2. Atomic POS and stock ledger transactions with idempotency, payment and receipt consistency.
3. Barcode printing/scanning pilot with actual hardware.
4. Verified invoice/GST and payment capture rules.
5. Owner approval of purchase permissions, cashier visibility, refunds and item editing.
6. Deployment security, backups, error monitoring, E2E device testing.
7. Confirm QR vs Code128, merchant-supplied product fields, scanner model, printer and invoice format.

## Important demo limitations
All inventory, transactions, receipts and role switches live in one browser's localStorage. Browser clearing erases them. No cross-device syncing, no real identity or owner enforcement. No actual payment acceptance. The barcode renderer is loaded from a third-party CDN and label/scan accuracy is unverified. This prototype must not hold real merchant inventory, customer data or issue legal tax invoices.
