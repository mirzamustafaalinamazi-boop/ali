# Stock Action by OTD — ECC delivery track

## Evidence and scope
V4 Nov 19 2026 integrated blueprint is source of truth (253 proposed feature records, 117 logical entities, 51 target screens). This branch adds a **fictional browser-only interactive demonstration**. It is not merchant-ready, and the demo data is intentionally fictional.

## Workstreams / roles / release gates
| Role | Scope | State | Acceptance / merge gate |
|---|---|---|---|
| Product & UX | workflows W01–W12, P1–P4, user journey | Ready | documented acceptance per workflow |
| Retail frontend | owner dashboard, POS, count, catalog | Demo implemented | accessibility & device E2E required |
| Inventory backend | tenancy, serializable ledger, reservations | Blocked | DB + authenticated transactions |
| Database | tenant scope, immutable movements, migrations | Blocked | isolation & concurrency tests |
| Ecommerce | publish, catalog, checkout, returns | Partial demo | payment reconciliation and security |
| AI/ML | catalog-grounded outfit generation | Rule-based demo | evaluation, safe retrieval, no hallucinations |
| Security | role ACL, tenant isolation, rate limits | Blocked | threat model, external security tests |
| QA | unit, integration, E2E, load | Partial tests | production verification matrix |
| DevOps | GitHub CI, staging, logs, rollback | Planning | CI green + staging smoke tests |
| Legal/finance | privacy, GST, seller of record, refunds | Blocked | India legal/accountant approval |

## Architecture for production
iPhone Safari / PWA and responsive web -> BFF/API -> auth + tenant roles -> PostgreSQL stock ledger + reservations (ACID transactions) -> publishing and orders -> payment/webhook workers -> event/outbox -> reporting/search -> AI suggestion service. Private merchant costs must never reach public endpoints. Each merchant/branch has scoped queries + database RLS where appropriate.

Proposed tables include tenants, memberships, roles, stores, products, variants, barcode_aliases, stock_locations, stock_balances, stock_movements, reservations, orders, order_items, payments, returns, stock_counts, count_lines, approvals, suppliers, purchase_orders, receipts, channel_listings, audit_events, AI_job_runs, recommendation_candidates, plans, subscriptions and idempotency_keys.

Stock invariant: ATS = on-hand − reservations − non-sellable − channel buffer; no independent editable 'ecommerce stock'. All sale/receiving/count events require idempotent atomic handling with concurrency checks and audit trail.

## CI and review rules
- PR into main; avoid direct production pushes.
- Two reviews for changes touching money, access control, data model or stock ledger; otherwise one.
- Formatting/lint, type checks, meaningful unit tests (target 80% coverage), API/integration tests, static security scan, dependency audit, container scan, mobile responsiveness and accessibility tests.
- No production release until payment webhook signature verification, tenant-crossing attack tests, negative inventory race tests, rollback & backups verified, privacy review and GST invoice compliance completed.
- AI must return only authorized in-stock SKUs and disclose sponsored placement.
- Staging smoke test required before deployment; feature flags for risky releases; log and rollback plan.

## Demo limitations
This page uses localStorage and includes no real auth, remote database, multi-user synchronization, payment gateway, barcode scanner, tax invoice, ML model or native App Store build. Do not onboard real retailer inventory here.
