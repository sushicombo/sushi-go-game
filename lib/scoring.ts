import { Card, MAKI_ICONS, Player } from "./types";

const NIGIRI_VALUE: Record<string, number> = {
  "nigiri-squid": 3,
  "nigiri-salmon": 2,
  "nigiri-egg": 1,
};

/** Scores one player's collection for the round (excludes pudding & maki, which are cross-player). */
export function scoreCollection(cards: Card[]): number {
  let score = 0;
  let unusedWasabi = 0;

  for (const card of cards) {
    if (card.type === "wasabi") {
      unusedWasabi++;
    } else if (card.type in NIGIRI_VALUE) {
      const base = NIGIRI_VALUE[card.type];
      if (unusedWasabi > 0) {
        unusedWasabi--;
        score += base * 3;
      } else {
        score += base;
      }
    }
  }

  const tempuraCount = cards.filter((c) => c.type === "tempura").length;
  score += Math.floor(tempuraCount / 2) * 5;

  const sashimiCount = cards.filter((c) => c.type === "sashimi").length;
  score += Math.floor(sashimiCount / 3) * 10;

  const dumplingCount = cards.filter((c) => c.type === "dumpling").length;
  score += [0, 1, 3, 6, 10, 15][Math.min(dumplingCount, 5)];

  return score;
}

export function scoreBreakdown(cards: Card[]) {
  let nigiri = 0;
  let unusedWasabi = 0;
  for (const card of cards) {
    if (card.type === "wasabi") unusedWasabi++;
    else if (card.type in NIGIRI_VALUE) {
      const base = NIGIRI_VALUE[card.type];
      if (unusedWasabi > 0) {
        unusedWasabi--;
        nigiri += base * 3;
      } else {
        nigiri += base;
      }
    }
  }
  const tempuraCount = cards.filter((c) => c.type === "tempura").length;
  const sashimiCount = cards.filter((c) => c.type === "sashimi").length;
  const dumplingCount = cards.filter((c) => c.type === "dumpling").length;
  return {
    nigiri,
    tempura: Math.floor(tempuraCount / 2) * 5,
    sashimi: Math.floor(sashimiCount / 3) * 10,
    dumpling: [0, 1, 3, 6, 10, 15][Math.min(dumplingCount, 5)],
  };
}

export function makiIconCount(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + (MAKI_ICONS[c.type] ?? 0), 0);
}

/** Returns per-player maki bonus points for the round. */
export function scoreMaki(players: Player[]): Record<string, number> {
  const counts = players.map((p) => ({ id: p.id, count: makiIconCount(p.collection) }));
  const bonus: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]));

  const nonZero = counts.filter((c) => c.count > 0);
  if (nonZero.length === 0) return bonus;

  const max = Math.max(...nonZero.map((c) => c.count));
  const firstPlace = nonZero.filter((c) => c.count === max);
  const firstShare = 6 / firstPlace.length;
  for (const p of firstPlace) bonus[p.id] += firstShare;

  const remaining = nonZero.filter((c) => c.count < max);
  if (remaining.length > 0) {
    const second = Math.max(...remaining.map((c) => c.count));
    const secondPlace = remaining.filter((c) => c.count === second);
    const secondShare = 3 / secondPlace.length;
    for (const p of secondPlace) bonus[p.id] += secondShare;
  }

  return bonus;
}

/** Returns per-player pudding bonus/penalty at game end. */
export function scorePudding(players: Player[]): Record<string, number> {
  const counts = players.map((p) => ({ id: p.id, count: p.puddings.length }));
  const bonus: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]));

  const max = Math.max(...counts.map((c) => c.count));
  const min = Math.min(...counts.map((c) => c.count));

  const mostPlace = counts.filter((c) => c.count === max);
  const mostShare = 6 / mostPlace.length;
  for (const p of mostPlace) bonus[p.id] += mostShare;

  if (max !== min) {
    const leastPlace = counts.filter((c) => c.count === min);
    const leastShare = 6 / leastPlace.length;
    for (const p of leastPlace) bonus[p.id] -= leastShare;
  }

  return bonus;
}
