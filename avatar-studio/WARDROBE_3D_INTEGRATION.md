# Wardrobe photo to 3D integration contract

Current state: the OTD closet stores confirmed garment records with category, color and optional photo. The Avatar Studio can select and display these records, but its present HumanForge asset pack contains complete outfits, shoes and headwear rather than separate tops, bottoms and accessories. A photographed item is **not** rendered as that garment on the 3D person.

To implement the requested pipeline, add a garment generation service and a reviewed asset library. Each generated item needs:

1. An explicit garment slot (`full`, `top`, `bottom`, `layer`, `shoes`, `accessory`) and category, plus a source wardrobe ID. Preserve the source photo privately and obtain consent before uploading it to a service.
2. Front, side and back geometry; UV texture and physically based material maps; a rig or skin weights matched to the avatar skeleton; size and body-shape fit metadata; and a clear license/provenance record. A single front photo cannot verify hidden surfaces or physical fit. Ask for extra views or mark those areas inferred.
3. A validated GLB output under documented triangle, texture, file size and safety limits. Reject malformed assets and incompatible skeletons before presenting them. Store a versioned generation record so a user can retry or replace an item.
4. A runtime slot loader that combines a full outfit **or** a top plus bottom, then optional layer, shoes and accessories. Resolve overlap and clipping at varied body presets and slider extremes; keep the user's chosen wardrobe IDs separate from sample asset IDs.
5. Closeup camera presets for face, fabric, shoes and accessories. Include front, 3/4, side and back views and capture tests. Label generated material or unseen construction as an approximation.

Do not describe sample meshes or a color tint as generated versions of the user's clothes. A production launch requires an actual model/service, usable uploads and outputs for each supported category, consent and deletion controls, cross-device storage, and visual QA against representative real garments and bodies.
