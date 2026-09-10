import { Card, CardType } from "./types";

export const COMPOSITION: Record<CardType, number> = {
  tempura: 14,
  sashimi: 14,
  dumpling: 14,
  maki1: 6,
  maki2: 12,
  maki3: 8,
  "nigiri-squid": 5,
  "nigiri-salmon": 10,
  "nigiri-egg": 5,
  pudding: 10,
  wasabi: 6,
  chopsticks: 4,
};

export function buildDeck(): Card[] {
  const cards: Card[] = [];
  let n = 0;
  for (const [type, count] of Object.entries(COMPOSITION) as [CardType, number][]) {
    for (let i = 0; i < count; i++) {
      cards.push({ id: `${type}-${n++}`, type });
    }
  }
  return cards;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const HAND_SIZE_BY_PLAYERS: Record<number, number> = {
  2: 10,
  3: 9,
  4: 8,
  5: 7,
};
