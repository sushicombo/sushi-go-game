import { CardType } from "./types";

/** `rule` is the scoring line printed on the physical card — it is information, not decoration. */
export const CARD_META: Record<CardType, { label: string; rule: string; accent: string }> = {
  tempura: { label: "Tempura", rule: "Pairs → 5", accent: "#a86a12" },
  sashimi: { label: "Sashimi", rule: "Threes → 10", accent: "#c8341f" },
  dumpling: { label: "Dumpling", rule: "1·3·6·10·15", accent: "#9a7226" },
  maki1: { label: "Maki", rule: "Most 6 · 2nd 3", accent: "#2c4a42" },
  maki2: { label: "Maki", rule: "Most 6 · 2nd 3", accent: "#2c4a42" },
  maki3: { label: "Maki", rule: "Most 6 · 2nd 3", accent: "#2c4a42" },
  "nigiri-squid": { label: "Squid Nigiri", rule: "3 points", accent: "#5c6f77" },
  "nigiri-salmon": { label: "Salmon Nigiri", rule: "2 points", accent: "#c8341f" },
  "nigiri-egg": { label: "Egg Nigiri", rule: "1 point", accent: "#a8801a" },
  pudding: { label: "Pudding", rule: "Most +6 · Least −6", accent: "#a2622c" },
  wasabi: { label: "Wasabi", rule: "Triples a nigiri", accent: "#4f8a2e" },
  chopsticks: { label: "Chopsticks", rule: "Take two", accent: "#a8763f" },
};

export const ORDER: CardType[] = [
  "nigiri-squid",
  "nigiri-salmon",
  "nigiri-egg",
  "wasabi",
  "sashimi",
  "tempura",
  "dumpling",
  "maki3",
  "maki2",
  "maki1",
  "pudding",
  "chopsticks",
];
