export type CardType =
  | "tempura"
  | "sashimi"
  | "dumpling"
  | "maki1"
  | "maki2"
  | "maki3"
  | "nigiri-squid"
  | "nigiri-salmon"
  | "nigiri-egg"
  | "pudding"
  | "wasabi"
  | "chopsticks";

export interface Card {
  id: string;
  type: CardType;
}

export type Difficulty = "easy" | "normal" | "hard" | "very-hard" | "extreme";

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  difficulty?: Difficulty;
  hand: Card[];
  collection: Card[]; // current round's played cards
  puddings: Card[]; // kept across rounds
  totalScore: number;
  roundScores: number[]; // per-round score (excludes pudding)
}

export interface GameState {
  players: Player[];
  deck: Card[];
  round: number; // 1,2,3
  handSize: number;
  turnDirection: "left"; // always left per rules
  phase: "setup" | "playing" | "round-end" | "game-end";
  humanChopsticksMode: boolean;
  /** Card ids the human held and passed on this round — the debrief reads these back. */
  passedByHuman: string[];
  log: string[];
}

export const MAKI_ICONS: Record<string, number> = {
  maki1: 1,
  maki2: 2,
  maki3: 3,
};
