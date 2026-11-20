# Production API contract — proposal only

Prefix: /v1. All mutation calls require authenticated session, tenant membership, server-side role checks, HTTPS, idempotency key, strict input validation, audit record and request correlation ID. All authorization is enforced server-side, not by a hidden button.

| Method | Route | Roles | Primary invariant |
|---|---|---|---|
| GET | /tenants/:tenantId/stores | member | strictly tenant scoped |
| GET | /tenants/:tenantId/variants | member | private costs only for authorized roles |
| POST | /tenants/:tenantId/variants | owner/admin | unique SKU and barcode mapping |
| POST | /tenants/:tenantId/receipts | admin/stock clerk as approved | accepted GRN only increases stock |
| POST | /tenants/:tenantId/pos/sales | cashier/admin | atomic decrement, no oversell, duplicate-safe |
| POST | /tenants/:tenantId/counts | stock clerk | snapshot and reconciliation window |
| POST | /tenants/:tenantId/counts/:id/approve | owner/admin | never self-approve if policy forbids |
| POST | /tenants/:tenantId/counts/:id/post | owner/admin | exactly-once ledger posting |
| PUT | /tenants/:tenantId/listings/:variantId | owner/admin | visibility only; no quantity fork |
| GET | /shops/:slug/catalog | public | only published, available variants, no cost |
| POST | /shops/:slug/orders/reserve | public with abuse guard | atomic held quantity with expiration |
| POST | /webhooks/payment-provider | signed provider only | signature, timestamp, duplicate-safe |
| GET | /tenants/:tenantId/audit | owner/admin | paginated immutable events |
| POST | /tenants/:tenantId/outfits/recommend | authorized plan | retrieval only from eligible stock |

## POS transaction pseudocode
BEGIN; verify actor + tenant + permission; INSERT idempotency key (reject same key with differing payload); SELECT stock balance FOR UPDATE; verify on_hand - reserved - non_sellable - buffer >= quantity; INSERT order + line; UPDATE stock_balances SET on_hand=on_hand-quantity,version=version+1; INSERT stock_movements; INSERT audit_events; record idempotent response; COMMIT. On transaction failure: ROLLBACK.

## Security gates
No SQL transaction is deployed by this documentation. Multi-tenant RLS policies and JWT claim reliability require independent implementation, penetration tests, concurrency simulation and legal/payment review. Data privacy: image permissions, consent, retention and delete/export workflows. AI outputs are suggestions, never a trusted financial or stock mutation source.
