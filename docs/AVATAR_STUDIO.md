# OTD Avatar Studio — Version 0.1 (illustrative preview)

**Scope:** A functional **2D vector avatar customization and styling illustration** integrated into the wardrobe-first OTD investor demo. Based on the avatar and virtual try-on **future-stage** descriptions in the `OTD_COMPLETE_APP_MASTER_HANDOUT_V3_1.pdf` (section 11), and the frontend handoff describing an existing mannequin/canvas presentation. This does not pretend the planned end-state 3D/avatar ML technologies have shipped.

## What is implemented

- Direct **Avatar Studio** entry from the Home page and app's auxiliary navigation.
- **VIEW ON AVATAR** action on wardrobe-grounded stylist recommendations. It transfers only the confirmed owned garment IDs from the chosen outfit.
- Choice of three purely illustrative silhouettes (Classic, Relaxed, Curve); five user-selected skin-tone palettes; four hairstyles; five hair colors; front/back orientation.
- Manual garment slots bound to confirmed items in the current device's Closet. Supports top/kurta, bottom/skirt, outer layer, footwear, accessory/dupatta and full-body (saree/dress/lehenga).
- Color-coded clothing layers on an original SVG fashion avatar, with a 2D label and no claims of actual fit.
- Saved-look **TRY THIS LOOK** action, persistent demo choices in localStorage, reset controls and user-triggered SVG download.
- Optional, explicitly fictional demo wardrobe. No consumer photo is transmitted for avatar generation.
- Automated unit tests for confirmed wardrobe ownership, traditional clothing, SVG escaping, front/back, reset/sanitization and wearable slots.

## Limitations clearly identified in the app

| Capability | Status |
|---|---|
| Illustrative avatar with user choices | **Implemented in demo** |
| Confirmed wardrobe + current selected outfit color preview | **Implemented in demo** |
| Generated looks linked to avatar | **Implemented in demo** |
| On-device settings persistence | **Implemented in demo** |
| Export stylized fashion SVG | **Implemented in demo** |
| Accurate garment photography mapping or texture transfer | **Not implemented** |
| Personal photo input for AI body/avatar generation | **Not implemented** |
| 3D mesh, measurements, realistic draping or fitting | **Not implemented** |
| Virtual try-on against the user's body photo | **Not implemented** |
| Garment segmentation, realistic size predictions | **Not implemented** |
| User account/synchronized secure cloud avatars | **Not implemented** |

No avatar silhouette or color is inferred from photographs; all sensitive choices are made manually, stay in this browser and can be reset/deleted. Do not misrepresent the results as actual garment likenesses.

## Investor demonstration

1. Open `https://otd-fashion-demo.vercel.app/#closet` and add/confirm your own clothing, **or** select the fictional example wardrobe.
2. Visit `#style`, choose occasion and mood, then generate a wardrobe-grounded look.
3. Tap **VIEW ON AVATAR**. The 2D illustration opens with the same selected garment IDs.
4. Change silhouette/tone/hair and layer selectors, then press **APPLY OUTFIT TO AVATAR**.
5. Return to Style, save a look, and test the Saved Look selector on the Avatar Studio.
6. Use **SAVE ILLUSTRATION AS SVG** for a permitted demo image.
7. Be explicit: real photorealistic try-on and fitting require further engineering and measured model quality.

## Next technical milestones

- Conduct model/product decisions on 2D vs 3D, consent, age/privacy and image retention.
- Define authenticated personal avatar storage, wardrobe association and safe share permissions.
- Research garment isolation, segmentation, catalog rights, cloth representation and model cost/latency.
- Implement representative body/garment geometry only after choosing suitable models and validating on Indian/fusion clothing.
- Benchmark output credibility, bias/fairness, failure cases and user trust before making claims about fit or size.
- Run manual mobile Safari device QA, screen reader testing, performance checks and external security review.

**Repository boundary:** This demonstration lives in `mirzamustafaalinamazi-boop/ali`. Your team's advanced source code is in `Vasantjv-2005/Ai-fashion-companion-OTD`; that separate repository was inspected and was not modified because integration returned 403 on branch creation.
