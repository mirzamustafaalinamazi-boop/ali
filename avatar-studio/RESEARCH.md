# Research decisions, 20 November 2026

The user asked for an avatar that starts from a selfie, resembles that person, turns in 3D and looks close to the supplied fashion renders and Snapchat Bitmoji examples. The four supplied ZIPs were inspected before selecting a path. `ali-main.zip` contains the current OTD consumer app and a procedural 3D beta. The complete integration kit contains a 2D/SVG editor, an offline HTML preview, backend examples and architecture notes; it explicitly lacks a realistic rigged human asset and a selfie-to-3D pipeline. The two smaller ZIPs repeat portions of that kit.

Public code reviewed:

- [HumanForge](https://github.com/abdulrehman043/humanforge): chosen foundation. It contains a textured MakeHuman-derived mesh, morph targets, editor, clothing proxies, browser selfie landmarker and face-fit solver. Its own README says the fit captures broad face proportions, not fine likeness, and does not infer hair.
- [MediaPipe Face Landmarker](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/tasks/web/vision): chosen landmark model. It runs in the browser and returns facial landmarks; it is not itself a 3D character renderer.
- [M3 CharacterStudio](https://github.com/M3-org/CharacterStudio): useful open-source avatar-editor pattern, but it does not by itself solve this project's selfie likeness requirement.
- [UnumAvatar](https://github.com/corpunum/UnumAvatar): photo-textured head reconstruction path; strongest for a talking photo head, less suitable for an editable full-body fashion character.
- [three.ws selfie-to-avatar design](https://github.com/nirholas/three.ws/blob/main/docs/selfie-to-avatar.md): useful capture gates and pipeline concepts; its remote reconstruction service is not part of this local build.
- [avatarforge](https://github.com/Altageris/avatarforge): parametric rigged avatar approach; its README explicitly says it is not photo reconstruction.

The [Bitmoji Reddit discussion](https://www.reddit.com/r/Bitmoji/comments/1ptb6hr/i_just_logged_back_in_after_a_while_to_the/) and [another likeness discussion](https://www.reddit.com/r/Bitmoji/comments/1ko7y9i/honestly_who_thought_this_was_an_upgrade/) are qualitative user feedback, not technical proof. They reinforce a product check: people notice face shape, lips and subtle facial differences. The editor therefore keeps detailed face controls after the selfie fit. Those discussions are not a representative survey.

The first local browser review confirmed that OTD's original procedural model was visibly much less faithful to the supplied reference than the textured human mesh. The new local studio rendered a face and responded to a supplied reference illustration through the selfie fitter, changing facial sliders. This verifies the pipeline runs in the browser. It does not verify likeness to a real person or equivalence to the reference render quality.
