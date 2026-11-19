# OTD Flagship Avatar Studio — 3D beta, November 19, 2026

## Founder's explicit product decision

**Priority: avatar.** Users should be able to create their own distinct OTD fashion character that resembles their *chosen appearance*, without supplying a selfie, body photograph or a reference person picture. This is a **stand-alone avatar area**, with a six-tab consumer navigation icon. Users should rotate a character through **360°**, customize face/body/hair/eyes, and **dress it automatically in a wardrobe-grounded OTD Stylist recommendation**. Inspiration: expressive avatar editors, but with a more material-rich visual treatment. We must not copy Snapchat proprietary models/assets, artwork or code.

## Implemented in this pull request

- Independent **3D Avatar Studio** in `#avatar3d`, accessible from the persistent **AVATAR** icon, header and Home.
- Custom procedural 3D meshes coded in `public/avatar3d-renderer.js` using pinned, MIT-licensed Three.js 0.180.0 (loaded from jsDelivr). No avatar supplier, image upload, selfie, AI generator or remote user-photo processing.
- Face controls: nine opt-in skin-tone palettes, six eye colors, eight hair colors, nine styles, four face profiles, sliders for eyes, nose, jaw, facial expression. No inferred gender, race or attractiveness; the available choices are artistic parameters.
- Body controls: independent shoulder, waist, hip and overall height sliders, four starting silhouettes and three poses. Artistic proportions **only**.
- Rotate the 3D character through 360 degrees with touch drag, keyboard arrows or buttons. Autospin, pause, zoom and screenshot download.
- Real **confirmed garment IDs** from Digital Closet selected by category, mapped to generated approximate 3D garment shells (tops, bottoms, dresses, sarees, lehengas, kurtas, jackets, shoes and accessories). The default neutral sample outfit is *purely a model demonstration* and is not saved as owned inventory.
- `STYLE` / **VIEW ON AVATAR** sends the generated owned-clothes outfit IDs directly into the 3D studio. **STYLE MY AVATAR FROM MY CLOSET** selects the best available complete outfit via OTD's existing deterministic ranking engine; accepts partial suggestions if necessary.
- Saves visual choices locally in the current browser only; existing Closet, saved looks, profile and planner continue to function. No customer data or photo leaves the device as part of this 3D module.
- Source and configuration safety tests in `tests/avatar3d.test.js`; CI includes JS syntax check and base functional tests. Mobile browser manual QA remains required.

## Exact claims and exclusions

**Built now:** a real-time, interactive WebGL 3D **procedural character** with 360-degree rotation, selectable facial/body features, a garment category-to-3D representation, and automatic wardrobe-based outfit assignment.

**Not built:** photorealistic or scan-accurate human resemblance; a Snapchat/Bitmoji-quality licensed/hand-sculpted character library; exact garments transcribed from 2D photographs into 3D meshes; textured/rigged/fitted digital garments; physically correct cloth drape, wrinkles or fit; real body measurements or sizing predictions; in-browser 3D creator accessible offline on first load (Three.js module requires internet); cloud profile persistence.

### Important investor statement

> “OTD has a working, no-photo-required 3D avatar customization and wardrobe-linked outfit preview. A higher-fidelity digital twin and physically accurate virtual fitting are R&D milestones requiring professionally rigged character assets, garment digitization, manufacturer size information, cloth simulation and cross-body fit validation.”

There are no credible grounds to promise that a garment's visual placement on this prototype guarantees how the purchased garment will look or fit in real life.

## Engineering progression to the founder's desired realism

**Milestone A — 3D foundation (this PR):** live renderer, easy avatar editor, proper closet/Stylist links, 360 interaction, sample garment geometry. Acceptance: mobile viewer loads, rotates, changes face, and applies at least one owned outfit by ID. No user photo required.

**Milestone B — art-directed character fidelity:** Work with a 3D technical artist to build an original stylized-realistic rigged, fully dressed base character, including licensed/sculpted hair/eyes/face blendshapes and meshes across natural-looking body proportions. Use glTF 2.0 or VRM where useful, asset versioning, topology and LOD/performance budgets. Avoid the legal risks of copying proprietary Snapchat assets. Add complexion diversity, neutral body wording, expressive face presets, and accessibility.

**Milestone C — real garment fidelity:** Get manufacturer-authorized 3D garment assets or digitize owned clothes from reliable photos plus metadata. Build a standard wardrobe asset pipeline: category → garment geometry → UV texture → skeleton/skin weights → collision and layering. Specific saree/kurta/dupatta handling needs different rigs and draping logic from Western garments.

**Milestone D — fitting validation:** Body dimensions must be independently user-controlled and optional. For actual size/fit, use verified measurements and brand size chart/physical garment specifications, collision detection and validated cloth simulation. Do not infer size from skin tone, body appearance, photos or arbitrary 3D sliders.

**Milestone E — quality gates:** Diverse participant user studies, mobile GPU frame rate, first render latency, GPU memory/thermal stability, hairstyle and clothing clipping QA, garment visual fidelity scoring, reliability, privacy, consent and legal sign-off. Define measured acceptance thresholds before telling investors this is a fit-accurate digital twin.

## Dependencies / operational risk

The live renderer imports pinned Three.js from `https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js`. If that CDN is unreachable, users see an understandable browser error with a 2D fallback. Before production, bundle and self-host a vetted dependency with a lockfile and vulnerability monitoring; verify on actual iOS Safari, Android Chrome, WebGL-disabled devices and low-memory mobiles. This demo is not a production security audit.

## QA walkthrough

1. Open `https://otd-fashion-demo.vercel.app/#avatar3d` on the target phone.
2. Confirm interactive model displays, swipe left/right 360°, spin/zoom controls respond, no overflow.
3. Change facial shape, hair, skin, eye size, body proportion; confirm changes display and persist on reload.
4. Visit Closet to confirm your own garments, or load labelled fictional samples.
5. Generate outfit in Style, then select **VIEW ON AVATAR**; confirm the corresponding garment IDs are active in the 3D preview.
6. Test **STYLE MY AVATAR FROM MY CLOSET**, saved looks, neutral default model, screenshot, reset, keyboard and reduced-motion mode.
7. Disconnect the network, trigger no-CDN behavior and ensure an accessible message and 2D fallback, not a blank page.
