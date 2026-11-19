# OTD ECC-inspired engineering rules

This is a prototype, not the official ECC plugin. Engineering workflow: scope -> plan -> test -> implement -> review -> verify -> handoff.

- Distinguish proposed, implemented, executed and verified work.
- Maintain merchant/outlet/variant-specific availability. Never present demo quantities as live.
- An offer claim is not a purchase, sale or verified redemption.
- Retailer stock updates in this demo persist only to localStorage; real merchant accounts require authenticated backend + tenant isolation.
- No payment, real retailer promotion or personal data processing without privacy/security and seller-of-record approvals.
- New features require acceptance tests and a recorded release gate. Run npm test, npm run check.
- Preserve data-model boundaries and never commit private credentials.
