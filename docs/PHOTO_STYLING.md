# OTD Photo Preview — realistic styling, inclusive by design

## Why this is a separate mode

The initial 2D Avatar Studio could only show abstract illustrations. An investor asked for a more realistic presentation in which more people can comfortably see themselves. The photo-based styling board lets a user **opt in to using their own real image**, without an inferred face, body-size category, attractiveness score, or narrow preselected identity. This is a real-photo **manual collage**, not artificial photo generation, and it does **not** infer body measurements or garment fit.

**Where to find it:** \`/#photo\`, the Home **PHOTO STYLING** CTA, or the Avatar Studio **OPEN PHOTO STUDIO** CTA.

## Implemented

1. Open the Photo Styling mode and choose any full-length photo from your phone or gallery (JPG/PNG/WebP, max 12MB). No face detection, body measurement, identity analysis or AI call.
2. Choose an existing confirmed Closet piece **with an image**, or upload an image of the garment directly from your device.
3. Place the garment cutout on the real image using touch gestures. A selected overlay can be resized and made more/less transparent using sliders.
4. Add multiple clothing overlays, switch between them and remove them independently.
5. Export the manual composition as a PNG. It is visibly labeled **not a fit prediction**.
6. Clear all temporary photos from memory. Reloading or closing the page also clears photos used in this Photo Studio; existing Closet images remain in the separate local Closet system until deleted.

### Limitations

- Clothing images are laid over the photograph, not automatically draped. A clean, transparent PNG garment cutout looks better than a photo with a busy background.
- OTD does **not** segment garments, reconstruct obscured cloth, match body pose automatically, model shadows, guarantee sizing, predict attractiveness or provide physically valid fit.
- This mode cannot turn a customer photo into a production-quality fashion campaign. It's a transparent demonstration of image composition and personalized styling.
- No remote image uploads or third-party visual AI services are invoked by the Photo Studio. It runs in-browser, without persisting temporary photographs in localStorage. The separate Closet's optional images are still browser-local and may persist until deleted in Closet.
- The system relies on browser canvas to export a composition, which can fail under extreme memory constraints or malformed images.

## Inclusive experience requirements

- Any user-supplied appearance, age, hairstyle, gender expression, traditional or Western clothing is welcome; no gender-based default avatar.
- Do not infer or label user's weight, attractiveness, gender, skin condition, ethnicity or measurements from their photo.
- Always make photo upload optional; the 2D illustration remains available for those who prefer not to share images.
- No body or fashion "beauty score," automated appearance ratings or negative body labels.
- Wording stays neutral, with clear source/consent and privacy messages.
- Treat photos and body data as sensitive. A later production backend will need photo retention controls, user access isolation, consent, deletion, media protection and legal review.

## Next engineering work for genuine realism

A *photorealistic image-to-image virtual try-on* requires product and engineering decisions that are **not** included in this PR:

1. Validate terms, security and consent for any candidate vision and try-on provider; do not send face/body photos to unknown third-party APIs.
2. Segment garments into usable cutouts and preserve garment identity; benchmark Indian traditional wear and layered outfits.
3. Generate realistic pose-aware images with a tested model. Evaluate visual faithfulness to the person, garment consistency, hallucination risk, demographic performance, latency and cost.
4. Separate *visual appearance* from *size accuracy*; photorealistic imagery cannot guarantee real-world fit.
5. Introduce strict upload limits, content moderation, private media storage, deletion, explicit consent and versioned audit logs.
6. Obtain permissions for sample assets and document any synthetic/model imagery disclosed to investors.

For investor discussions, describe the new mode as **local interactive photo styling**; describe genuine photorealistic try-on as **R&D / pending provider integration**.
