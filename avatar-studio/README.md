# OTD Avatar Studio — higher fidelity working prototype

This folder builds the new OTD avatar at `/avatar-studio/` in the `ali-main` app. It uses a textured, deformable human mesh, hair, eyes, sample clothing, 360° rotation and a browser-only selfie fitter. The supplied OTD images guide the champagne and espresso interface and the emphasis on a natural face. They are **design references**, not 3D assets or a selfie of a real user.

## Run

From this folder:

```powershell
npm ci
npm run check
npm run build
```

From `../ali-main/ali-main`:

```powershell
npm test
npm run check
npm start
```

Open `http://localhost:3000/avatar-studio/`. The first load downloads assets from the local OTD server. The photo, model and WASM are processed locally in the browser; no selfie endpoint is called. Avatar controls save as JSON in that browser's `localStorage`. The Save button also downloads a PNG preview.

## Exact capability boundary

- The selfie step detects a face, fits visible face proportions to a human morph library, samples skin and iris colors, and applies editable controls.
- It does **not** reconstruct hidden face depth, hair style or color, exact lip/nose anatomy, full body dimensions, garment fit, or the supplied reference's photorealistic editorial render quality.
- The 3D outfits come from the local HumanForge asset pack. They do not reconstruct a real OTD closet garment or promise fit.
- A real human selfie is required to judge actual likeness. The included reference images contain rendered avatars, not a user's face. The browser pipeline was exercised with one supplied illustration as an input check only.
- This is a local prototype build. It has not been deployed or tested on a physical iPhone or Android device.

## Source and licenses

HumanForge 0.8.1 source, mesh assets and MakeHuman-derived CC0 assets were copied from [commit `2226df1f`](https://github.com/abdulrehman043/humanforge/tree/2226df1f50a04c5a8e1c02ea33780d28337dfbb1) on 20 November 2026. Its code is MIT; the included human assets are declared CC0 in `LICENSE.ASSETS.md`. We keep the full MIT text in `LICENSE.humanforge.txt`. MediaPipe Tasks Vision 1.1.1 is Apache 2.0 and its face model is served locally. Review `THIRD_PARTY.md` before a commercial release. No Snapchat or Bitmoji code, meshes or artwork is included.

## Release checks

Before external release, test multiple consenting people against their own selfies in controlled lighting, collect side-by-side likeness ratings and failure reports, validate mobile memory and load time, review licenses, and test privacy/storage controls. The user's visual references establish a style target, not evidence that the present model meets it.
