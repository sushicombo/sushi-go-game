import { Card, CardType, Difficulty, MAKI_ICONS, Player } from "./types";
import { COMPOSITION } from "./deck";
import { makiIconCount, scoreCollection } from "./scoring";

const DUMPLING_CURVE = [0, 1, 3, 6, 10, 15];
const NIGIRI_VALUE: Record<string, number> = {
  "nigiri-squid": 3,
  "nigiri-salmon": 2,
  "nigiri-egg": 1,
};

export interface BotContext {
  /** Cards this bot will still draft this round, including the current turn. */
  turnsLeft: number;
  handSize: number;
  round: number;
  /** Opponents ordered by how soon they receive this bot's passed hand. */
  downstream: Player[];
  /** Every card whose identity this bot can legitimately know: all face-up play plus its own hand. */
  seen: Card[];
}

interface Tier {
  /** Weighs future set completion instead of only immediate points. */
  projects: boolean;
  /** Counts unseen cards to know whether a set can still be filled. */
  counts: boolean;
  /** How hard it drafts cards away from the players downstream of it. */
  denial: number;
  /** Spends its denial on whoever is actually winning instead of spreading it evenly. */
  targets: boolean;
  /** Weighs the maki and pudding races as real point swings. */
  races: boolean;
  /** Evaluates chopsticks pairs jointly, so wasabi plus nigiri is seen as one play. */
  pairs: boolean;
}

const TIERS: Record<Difficulty, Tier> = {
  easy: { projects: false, counts: false, denial: 0, targets: false, races: false, pairs: false },
  normal: { projects: false, counts: false, denial: 0, targets: false, races: false, pairs: false },
  hard: { projects: true, counts: false, denial: 0.15, targets: false, races: true, pairs: false },
  "very-hard": { projects: true, counts: true, denial: 0.35, targets: false, races: true, pairs: true },
  extreme: { projects: true, counts: true, denial: 0.4, targets: true, races: true, pairs: true },
};

function count(cards: Card[], type: CardType): number {
  return cards.filter((c) => c.type === type).length;
}

function unusedWasabi(collection: Card[]): number {
  let open = 0;
  for (const c of collection) {
    if (c.type === "wasabi") open++;
    else if (c.type.startsWith("nigiri") && open > 0) open--;
  }
  return open;
}

const DECK_SIZE = 108;
/** Tuned against lib/tournament.ts — raising it makes bots chase sets they cannot finish. */
const CHASE = 1.1;

interface Supply {
  remaining: number;
  density: number;
}

/**
 * What is still gettable. A counting bot subtracts what it has watched go face-up;
 * a non-counting bot falls back to the deck's own proportions, which is still honest.
 */
function supplyOf(type: CardType, ctx: BotContext, tier: Tier): Supply {
  if (!tier.counts) {
    return { remaining: COMPOSITION[type], density: COMPOSITION[type] / DECK_SIZE };
  }
  const remaining = Math.max(0, COMPOSITION[type] - count(ctx.seen, type));
  const pool = Math.max(1, DECK_SIZE - ctx.seen.length);
  return { remaining, density: remaining / pool };
}

/**
 * Chance of collecting `need` more of something in `turnsLeft` picks.
 * Scarcity is what decides this: fourteen sashimi in a hundred and eight cards is
 * a thin stream, so a triple started late is a set that never lands.
 */
function completionChance(need: number, turnsLeft: number, supply: Supply): number {
  if (need <= 0) return 1;
  if (turnsLeft < need || supply.remaining < need) return 0;
  return Math.max(0, Math.min(0.92, (turnsLeft / need) * supply.density * CHASE));
}

/** Expected end-of-round points from a collection, counting sets that are still likely to finish. */
function expectedValue(collection: Card[], ctx: BotContext, tier: Tier): number {
  let total = scoreCollection(collection);
  if (!tier.projects) return total;

  const tempura = count(collection, "tempura");
  if (tempura % 2 === 1) {
    total += 5 * completionChance(1, ctx.turnsLeft, supplyOf("tempura", ctx, tier));
  }

  const sashimi = count(collection, "sashimi");
  const sashimiNeed = (3 - (sashimi % 3)) % 3;
  if (sashimiNeed > 0) {
    total += 10 * completionChance(sashimiNeed, ctx.turnsLeft, supplyOf("sashimi", ctx, tier));
  }

  const open = unusedWasabi(collection);
  if (open > 0) {
    const kinds = (["nigiri-squid", "nigiri-salmon", "nigiri-egg"] as CardType[]).map((t) => ({
      t,
      s: supplyOf(t, ctx, tier),
    }));
    const remaining = kinds.reduce((s, x) => s + x.s.remaining, 0);
    const density = kinds.reduce((s, x) => s + x.s.density, 0);
    const avg =
      remaining > 0 ? kinds.reduce((s, x) => s + x.s.remaining * NIGIRI_VALUE[x.t], 0) / remaining : 2;
    // A wasabi only pays when a nigiri lands on it, and it pays double its face value.
    total += open * avg * 2 * completionChance(1, ctx.turnsLeft, { remaining, density });
  }

  return total;
}

function makiPoints(mine: number, others: number[]): number {
  if (mine <= 0) return 0;
  const all = [mine, ...others].filter((n) => n > 0);
  const max = Math.max(...all);
  if (mine === max) return 6 / all.filter((n) => n === max).length;
  const rest = all.filter((n) => n < max);
  if (rest.length === 0) return 0;
  const second = Math.max(...rest);
  return mine === second ? 3 / rest.filter((n) => n === second).length : 0;
}

function puddingPoints(mine: number, others: number[]): number {
  const all = [mine, ...others];
  const max = Math.max(...all);
  const min = Math.min(...all);
  let pts = 0;
  if (mine === max) pts += 6 / all.filter((n) => n === max).length;
  if (max !== min && mine === min) pts -= 6 / all.filter((n) => n === min).length;
  return pts;
}

/** Points a card is worth to whoever holds `collection`, races included. */
function valueFor(
  card: Card,
  player: Player,
  ctx: BotContext,
  tier: Tier,
  opponents: Player[]
): number {
  const before = expectedValue(player.collection, ctx, tier);
  const after = expectedValue([...player.collection, card], ctx, tier);
  let value = after - before;

  if (tier.races) {
    const icons = MAKI_ICONS[card.type] ?? 0;
    if (icons > 0) {
      const others = opponents.map((o) => makiIconCount(o.collection));
      const mine = makiIconCount(player.collection);
      // Standings early in a round mean little; late they are nearly final.
      const settled = 0.55 + 0.45 * (1 - ctx.turnsLeft / Math.max(1, ctx.handSize));
      value += (makiPoints(mine + icons, others) - makiPoints(mine, others)) * settled;
    }

    if (card.type === "pudding") {
      const others = opponents.map((o) => o.puddings.length);
      const mine = player.puddings.length;
      // Pudding only cashes out after round three; a human skips it round one and
      // prioritizes it hard once few rounds remain to close the gap.
      const weight = [0, 0.15, 0.65, 1][Math.min(ctx.round, 3)];
      value += (puddingPoints(mine + 1, others) - puddingPoints(mine, others)) * weight;
    }
  } else if (card.type === "pudding") {
    value += 3;
  }

  if (card.type === "chopsticks") {
    // Worth nothing on the last turn; worth a second pick when turns remain.
    value += ctx.turnsLeft > 1 ? Math.min(3, ctx.turnsLeft * 0.7) : 0;
  }

  return value;
}

function standing(player: Player): number {
  return player.totalScore + scoreCollection(player.collection);
}

/** What taking this card denies the players who would have seen it next. */
function denialValue(card: Card, self: Player, ctx: BotContext, tier: Tier): number {
  if (tier.denial <= 0) return 0;
  const mine = standing(self);
  let total = 0;
  ctx.downstream.forEach((opp, i) => {
    const others = ctx.downstream.filter((p) => p.id !== opp.id);
    const gain = valueFor(card, opp, ctx, tier, others);
    // The next seat sees the card first, so denying them is worth the most.
    let weight = Math.pow(0.55, i);
    // Blocking the player who is beating you is worth more than blocking the one who is not.
    if (tier.targets) weight *= 1 + Math.max(0, standing(opp) - mine) / 10;
    total += Math.max(0, gain) * weight;
  });
  return total * tier.denial;
}

function scoreCard(card: Card, player: Player, ctx: BotContext, tier: Tier): number {
  return valueFor(card, player, ctx, tier, ctx.downstream) + denialValue(card, player, ctx, tier);
}

/** Decide the bot's move: which card(s) to take and whether to use chopsticks. */
export function decideBotMove(
  player: Player,
  otherPlayers: Player[],
  difficulty: Difficulty,
  context?: Partial<BotContext>
): { cards: Card[]; useChopsticks: boolean } {
  const hand = player.hand;

  if (difficulty === "easy") {
    return { cards: [hand[Math.floor(Math.random() * hand.length)]], useChopsticks: false };
  }

  const tier = TIERS[difficulty];
  const ctx: BotContext = {
    turnsLeft: context?.turnsLeft ?? hand.length,
    handSize: context?.handSize ?? hand.length,
    round: context?.round ?? 1,
    downstream: context?.downstream ?? otherPlayers,
    seen: context?.seen ?? [...hand, ...player.collection],
  };

  const ranked = hand
    .map((card) => ({ card, value: scoreCard(card, player, ctx, tier) }))
    .sort((a, b) => b.value - a.value);

  const hasChopsticks = player.collection.some((c) => c.type === "chopsticks");
  if (!hasChopsticks || hand.length < 2) {
    return { cards: [ranked[0].card], useChopsticks: false };
  }

  if (!tier.pairs) {
    return ranked[1].value > 1
      ? { cards: [ranked[0].card, ranked[1].card], useChopsticks: true }
      : { cards: [ranked[0].card], useChopsticks: false };
  }

  // Two cards taken together can be worth more than the sum of their parts —
  // a wasabi and a squid nigiri in the same turn is nine points, not four.
  let bestPair: { cards: Card[]; value: number } | null = null;
  for (let i = 0; i < hand.length; i++) {
    for (let j = 0; j < hand.length; j++) {
      if (i === j) continue;
      const first = hand[i];
      const second = hand[j];
      const withFirst: Player = { ...player, collection: [...player.collection, first] };
      const pairCtx = { ...ctx, turnsLeft: Math.max(1, ctx.turnsLeft - 1) };
      const value =
        scoreCard(first, player, ctx, tier) + scoreCard(second, withFirst, pairCtx, tier);
      if (!bestPair || value > bestPair.value) bestPair = { cards: [first, second], value };
    }
  }

  // Spending the chopsticks costs a card slot, so the pair has to beat the single pick outright.
  if (bestPair && bestPair.value > ranked[0].value + 1.5) {
    return { cards: bestPair.cards, useChopsticks: true };
  }
  return { cards: [ranked[0].card], useChopsticks: false };
}
