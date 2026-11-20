# Avatar Studio route release gate

The public demo's Avatar entry points open `/avatar-studio/`, which serves the improved textured 3D human model and editable selfie-fit controls. The previous `#avatar3d` parametric renderer remains in source for compatibility but redirects to the studio when opened from an old bookmark.

Acceptance: `npm test` and `npm run check` pass; `/avatar-studio/`, its script, face model and human mesh return successfully from the local server; the public URL and mobile layout are visually inspected after deployment. This is still a visual avatar prototype: a selfie does not prove exact likeness and wardrobe photos do not become fitted 3D garments. Physical Android and iPhone performance checks remain a release gate.
