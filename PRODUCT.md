# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A single player training alone against bots. He is an experienced Sushi Go! player at the casual/social level who recently lost a face-to-face game because an opponent seated beside him repeatedly drafted cards to block his sets. He plays deliberately, wants to sharpen his read of the table, and is not a beginner learning the rules.

## Product Purpose

A faithful solo simulator of the Sushi Go! card game that builds drafting skill — specifically the ability to read opponents' collections and anticipate blocking. Success is the player noticing, mid-draft, what an opponent is one card away from completing, and acting on it. The game is a practice apparatus, not entertainment for an audience; it is never sold or distributed.

## Positioning

Most digital Sushi Go! implementations are either social/multiplayer or beginner tutorials. This one exists solely as a training rig: bots that actively deny the player, and a post-round debrief that names the specific drafting mistakes that cost points.

## Operating Context

Played solo in short sessions on both desktop and phone with full parity — desktop at a keyboard, phone in portrait. A full game is three rounds and takes a few minutes. The player must be able to scan every opponent's face-up collection at a glance while choosing from his own hand; that scan is the core skill being trained, so it is a primary layout requirement on both device classes rather than a desktop-only affordance.

## Capabilities and Constraints

- 3–5 total players (the human plus 2–4 bots). Two-player mode is out of scope, so the official two-player pudding exception never applies.
- Bot difficulty is selected once per game and applies uniformly to all bots. Five tiers, each strictly stronger than the one below, verified by `lib/tournament.ts`: Easy (random), Normal (immediate points only), Hard (adds turn-aware set projection and the maki/pudding races), Very Hard (adds card counting and denial of the seat to its left), Extreme (adds denial targeted at whoever is leading, plus joint evaluation of chopsticks pairs).
- The tiers are tuned against measurement, not taste. A fixed strong player's win rate falls from 25% at an even table to 16% against Very Hard and 13% against Extreme; `hard vs hard` measures exactly 25%, which is the harness's own bias check. Re-run `npx tsx lib/tournament.ts` after any change to bot heuristics or scoring.
- Exactly three rounds. Standard 108-card deck: 14 Tempura, 14 Sashimi, 14 Dumpling, 26 Maki (6×1, 12×2, 8×3), 20 Nigiri (5 Squid, 10 Salmon, 5 Egg), 10 Pudding, 6 Wasabi, 4 Chopsticks.
- Scoring follows the official rulebook without deviation, including order-dependent Wasabi/Nigiri tripling, and Maki and Pudding ties split as exact fractional values (no rounding).
- Chopsticks returns to the passed hand — it re-enters circulation rather than staying with the player who used it.
- Post-round coaching: after each round the player is shown what his drafting cost him — cards he passed that scored for opponents, sets left incomplete, and Maki/Pudding races lost by a narrow margin. Coaching is retrospective only; nothing hints or suggests during the live draft, because forming his own read of the table is the skill being trained.
- Persistence is limited to resuming the current game after a refresh (localStorage). No cross-game stats, no win/loss record, no game history.
- Client-only. No backend, no accounts, no network play.
- Card artwork must be original. The published Sushi Go! illustrations are copyrighted and must never be reproduced or fetched; the interface evokes the game's spirit through its own artwork.

## Brand Commitments

The name "Sushi Go!" and the card, ingredient, and mechanic terminology from the official rulebook are fixed and must be used verbatim. The player asked that the game evoke the feel of the original physical board game.

## Evidence on Hand

The official rulebook text (setup, drafting, card abilities, scoring, pudding endgame) was supplied verbatim by the player and is authoritative. No licensed artwork, no brand assets, no imagery of the physical product are available or permitted.

## Product Principles

1. **The rulebook is law.** Any ambiguity resolves to the printed rules, never to a convenient simplification.
2. **Train the read, not the reflex.** The interface must make opponents' board states effortless to scan; it must not make the decision for the player.
3. **Coaching comes after, never during.** Feedback lands between rounds, once the choices are already made.
4. **Original artwork only.** Evoke the game; never reproduce it.
5. **One player, no audience.** No social features, no accounts, no persistence beyond finishing the game in front of him.
