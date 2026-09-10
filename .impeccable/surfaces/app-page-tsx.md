---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/GameBoard.tsx","components/Setup.tsx","components/RoundSummary.tsx","components/Card.tsx","components/icons.tsx"]
---

Scope: the Sushi Go! game surface — setup, board, round debrief, final results. Visitor mode: Operate.

Audience: one player training alone against bots, reading opponents' boards to learn blocking. Task: draft one card per turn while scanning every opponent's collection. Constraint: full desktop and mobile parity; no coaching during the draft.

## Direction contract

THESIS: The app is the plush toy chest its own favicon came out of — every card is a stuffed sushi object you could pick up. Refuses the lacquer/urushi restaurant tray it replaces, and refuses the flat pastel board-game app with drop shadows.

OWN-WORLD: Ink is cold charcoal #2F3E44, drawn at 3.4/64 uniform weight around every shape. Flat fills only, zero gradients: coral #EE5A47, rice cream #FBF0DE, wheat #E7D2A2, nori #3C5A52, yolk #F7C64B, leaf #8FC05C. Ground is deeper rice #EDE2CC so cream cards separate. Depth is solid offset ink (0 5px 0), never blur. Faces are banned — silhouette carries recognition. Fredoka for numerals and names, Nunito for prose.

STORY: The player sees five boards at once as rows of plush objects, spots who is one card from a set, drafts against them, and after the round is told in plain numbers what that read cost.

FIRST VIEWPORT: Opponent boards run as outlined pill-wells across the top, each holding that player's plush plates with counts. Your own well is the wide one beneath, holding full card faces. Your hand sits on a raised rice-cream rail along the bottom, cards lifting on a solid ink offset when selected. Round spine and score in charcoal at top left; Serve sits at the right end of the rail.

FORM: Plush Toy Chest — pinned by the user to app/favicon.ico (sushigo.ico), which beats the roll. Replaces seed ca33e541's Bentō Tray wholesale. Raise kept from the discarded direction: the threat read — an opponent's well outlines in coral the moment they are one card from completing a set. Motion grammar: cards settle with a short damped squash, never a bounce; nothing slides.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
