import { Card, GameState, MAKI_ICONS, Player } from "./types";
import { makiIconCount, scoreCollection } from "./scoring";
import { CARD_META } from "./cardMeta";

export interface Threat {
  label: string;
  points: number;
}

/** Only a threat worth blocking lights a well; a lone odd tempura would light every well every turn. */
export const THREAT_ALARM = 9;

export function isAlarming(list: Threat[]): boolean {
  return list.some((t) => t.points >= THREAT_ALARM);
}

/** What this collection is one card away from. Reads only face-up, public information. */
export function threats(collection: Card[]): Threat[] {
  const out: Threat[] = [];

  const sashimi = collection.filter((c) => c.type === "sashimi").length;
  if (sashimi % 3 === 2) out.push({ label: "one from sashimi", points: 10 });

  const tempura = collection.filter((c) => c.type === "tempura").length;
  if (tempura % 2 === 1) out.push({ label: "one from tempura", points: 5 });

  let unusedWasabi = 0;
  for (const c of collection) {
    if (c.type === "wasabi") unusedWasabi++;
    else if (c.type.startsWith("nigiri") && unusedWasabi > 0) unusedWasabi--;
  }
  if (unusedWasabi > 0) out.push({ label: "wasabi open", points: 9 });

  const dumpling = collection.filter((c) => c.type === "dumpling").length;
  if (dumpling >= 3 && dumpling < 5) {
    out.push({ label: "dumplings running", points: [0, 1, 3, 6, 10, 15][dumpling + 1] - [0, 1, 3, 6, 10, 15][dumpling] });
  }

  return out;
}

function marginalValue(collection: Card[], card: Card): number {
  const without = collection.filter((c) => c.id !== card.id);
  return scoreCollection(collection) - scoreCollection(without);
}

export interface Gift {
  cardLabel: string;
  cardType: Card["type"];
  takerName: string;
  points: number;
  count: number;
  note: string;
}

export interface Lapse {
  label: string;
  detail: string;
}

export interface Debrief {
  gifts: Gift[];
  leftOnTable: Lapse[];
  races: Lapse[];
}

/** Retrospective coaching for the human, read off the round that just scored. */
export function debrief(state: GameState): Debrief {
  const human = state.players[0];
  const opponents = state.players.slice(1);
  const passed = new Set(state.passedByHuman);

  // The same player taking three of your egg nigiri is one lesson, not three rows.
  const merged = new Map<string, Gift>();
  for (const opp of opponents) {
    for (const card of opp.collection) {
      if (!passed.has(card.id)) continue;
      const points = marginalValue(opp.collection, card);
      const icons = MAKI_ICONS[card.type] ?? 0;
      if (points <= 0 && icons === 0) continue;
      const key = `${opp.id}:${card.type}`;
      const existing = merged.get(key);
      if (existing) {
        existing.points += points;
        existing.count += 1;
        continue;
      }
      merged.set(key, {
        cardLabel: CARD_META[card.type].label,
        cardType: card.type,
        takerName: opp.name,
        points,
        count: 1,
        note: icons > 0 ? `toward the roll race` : "",
      });
    }
  }
  const gifts = [...merged.values()].sort((a, b) => b.points - a.points || b.count - a.count);

  const leftOnTable: Lapse[] = [];
  const sashimi = human.collection.filter((c) => c.type === "sashimi").length;
  if (sashimi % 3 !== 0) {
    const short = 3 - (sashimi % 3);
    leftOnTable.push({
      label: `${sashimi} sashimi, ${short} short`,
      detail: `A third would have been 10 points. You finished ${short} away.`,
    });
  }
  const tempura = human.collection.filter((c) => c.type === "tempura").length;
  if (tempura % 2 === 1) {
    leftOnTable.push({
      label: `${tempura} tempura, 1 short`,
      detail: "One more tempura was 5 points sitting on the table.",
    });
  }
  let unusedWasabi = 0;
  for (const c of human.collection) {
    if (c.type === "wasabi") unusedWasabi++;
    else if (c.type.startsWith("nigiri") && unusedWasabi > 0) unusedWasabi--;
  }
  if (unusedWasabi > 0) {
    leftOnTable.push({
      label: `${unusedWasabi} wasabi never used`,
      detail: "Wasabi scores nothing alone. A squid on top would have been 9.",
    });
  }

  const races: Lapse[] = [];
  const myMaki = makiIconCount(human.collection);
  const topMaki = Math.max(...state.players.map((p) => makiIconCount(p.collection)));
  if (topMaki > 0 && myMaki < topMaki) {
    const leader = state.players.find((p) => makiIconCount(p.collection) === topMaki) as Player;
    races.push({
      label: `Maki: ${myMaki} against ${topMaki}`,
      detail:
        topMaki - myMaki <= 2
          ? `${leader.name} took the roll race by ${topMaki - myMaki}. One more roll card would have flipped it.`
          : `${leader.name} ran away with the roll race.`,
    });
  }

  const myPudding = human.puddings.length;
  const topPudding = Math.max(...state.players.map((p) => p.puddings.length));
  const lowPudding = Math.min(...state.players.map((p) => p.puddings.length));
  if (myPudding === lowPudding && topPudding !== lowPudding) {
    races.push({
      label: `Pudding: ${myPudding} — last place`,
      detail: "Fewest puddings is minus 6 at the end of the game. There is still time.",
    });
  }

  return { gifts: gifts.slice(0, 4), leftOnTable, races };
}
