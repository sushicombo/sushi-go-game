---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/GameBoard.tsx","components/Setup.tsx","components/RoundSummary.tsx","components/Card.tsx"]
---

Scope: the Sushi Go! game surface — setup, board, round debrief, final results. Visitor mode: Operate.

Audience: one player training alone against bots, reading opponents' boards to learn blocking. Task: draft one card per turn while scanning every opponent's collection. Constraint: full desktop and mobile parity; no coaching during the draft.

## Direction contract

THESIS: Every player is a compartment in one lacquer bentō tray, so the whole table reads in a single sweep. Refuses the green-felt card table with fanned hands and a scoreboard sidebar, and refuses its opposite, the soft-shadow pastel board-game app.

OWN-WORLD: Urushi black ground (#141010), shu vermilion (#C4341B) carrying whole regions, maki-e gold (#C9A227) for tallies only, rice cream (#F0E7D4) for card faces. Recessed wells with raised cedar dividers; the dividers are the only chrome. No shadows floating cards above a page — everything is inset into the tray.

STORY: The player sees five boards at once, spots who is one card from a set, drafts against them, and after the round is told in plain numbers what that read cost or saved.

FIRST VIEWPORT: The screen IS one tray. Opponent compartments run as a ranked row across the top, each a recessed vermilion-lined well holding that player's plates face-up. Your own compartment is the wide well beneath. Your hand sits on a cedar rail along the bottom edge, the only element overlapping the tray. Round and running score struck in gold on the tray rim. Primary action (confirm pick) sits at the right end of the cedar rail, within thumb reach on mobile.

FORM: The Bentō Tray — candidate 3 of seven grounded directions (kaitenzushi belt, ordering terminal, bentō tray, Showa matchbox print, noren, sumo banzuke, Osaka kanban). Seed key ca33e541. Raises taken: scale-only hierarchy (from Variable Font Specimen), every mark encodes state (from TDR), the frame is the grid (from Elbow Panel), one governing spine across rounds (from Deep Dive), the hand visibly depletes (from Cloud Quarry). Signature interaction: the threat read — an opponent's well lights its divider in vermilion the moment they are one card from completing a set, so blocking becomes visible before it becomes scored. Motion grammar: cards seat into wells with a short damped settle, never a bounce; the tray never slides.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
