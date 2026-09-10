import { Card, Difficulty, GameState, Player } from "./types";
import { buildDeck, HAND_SIZE_BY_PLAYERS, shuffle } from "./deck";
import { scoreCollection, scoreMaki, scorePudding } from "./scoring";
import { decideBotMove } from "./bot";

const BOT_NAMES = ["Miso", "Nori", "Wasabi-chan", "Tofu"];

export function createGame(numPlayers: number, difficulty: Difficulty): GameState {
  const handSize = HAND_SIZE_BY_PLAYERS[numPlayers];
  const deck = shuffle(buildDeck());

  const players: Player[] = [
    {
      id: "human",
      name: "You",
      isBot: false,
      hand: [],
      collection: [],
      puddings: [],
      totalScore: 0,
      roundScores: [],
    },
    ...Array.from({ length: numPlayers - 1 }, (_, i) => ({
      id: `bot-${i}`,
      name: BOT_NAMES[i] ?? `Bot ${i + 1}`,
      isBot: true,
      difficulty,
      hand: [],
      collection: [],
      puddings: [],
      totalScore: 0,
      roundScores: [],
    })),
  ];

  const state: GameState = {
    players,
    deck,
    round: 0,
    handSize,
    turnDirection: "left",
    phase: "setup",
    humanChopsticksMode: false,
    passedByHuman: [],
    log: [],
  };

  return dealRound(state);
}

function dealRound(state: GameState): GameState {
  const deck = [...state.deck];
  const players = state.players.map((p) => {
    const hand = deck.splice(0, state.handSize);
    return { ...p, hand, collection: [] };
  });
  return {
    ...state,
    deck,
    players,
    round: state.round + 1,
    phase: "playing",
    passedByHuman: [],
    log: [...state.log, `Round ${state.round + 1} begins.`],
  };
}

interface Selection {
  cardIds: string[];
  useChopsticks: boolean;
}

function applyPick(player: Player, cardIds: string[], useChopsticks: boolean) {
  const picked = player.hand.filter((c) => cardIds.includes(c.id));
  let hand = player.hand.filter((c) => !cardIds.includes(c.id));
  let collection = [...player.collection, ...picked];

  if (useChopsticks) {
    const idx = collection.findIndex((c) => c.type === "chopsticks");
    if (idx !== -1) {
      const [chopsticks] = collection.splice(idx, 1);
      hand = [...hand, chopsticks];
    }
  }

  return { hand, collection };
}

/** Plays one drafting turn. `humanSelection` is ignored when hands only have 1 card (auto-take). */
export function playTurn(state: GameState, humanSelection: Selection): GameState {
  const n = state.players.length;
  const isFinalCard = state.players[0].hand.length === 1;

  const results = state.players.map((player, i) => {
    if (isFinalCard) {
      return applyPick(player, [player.hand[0].id], false);
    }
    if (!player.isBot) {
      return applyPick(player, humanSelection.cardIds, humanSelection.useChopsticks);
    }
    const other = state.players.filter((p) => p.id !== player.id);
    // Seats in the order they receive this bot's passed hand, so denial weights the nearest first.
    const downstream = Array.from({ length: n - 1 }, (_, k) => state.players[(i + 1 + k) % n]);
    const move = decideBotMove(player, other, player.difficulty ?? "normal", {
      turnsLeft: player.hand.length,
      handSize: state.handSize,
      round: state.round,
      downstream,
      // Everything face-up on the table plus its own hand: public knowledge, not peeking.
      seen: [...state.players.flatMap((p) => p.collection), ...player.hand],
    });
    return applyPick(
      player,
      move.cards.map((c) => c.id),
      move.useChopsticks
    );
  });

  let players = state.players.map((p, i) => ({
    ...p,
    collection: results[i].collection,
    hand: results[i].hand,
  }));

  // What the human is about to hand over is exactly what the debrief holds them to.
  const passedByHuman = isFinalCard
    ? state.passedByHuman
    : [...new Set([...state.passedByHuman, ...results[0].hand.map((c) => c.id)])];

  if (!isFinalCard) {
    // pass hands to the left: player i's remaining hand goes to player (i+1) % n
    const passedHands = results.map((r) => r.hand);
    players = players.map((p, i) => ({ ...p, hand: passedHands[(i - 1 + n) % n] }));
  }

  const roundOver = players[0].hand.length === 0;

  if (!roundOver) {
    return { ...state, players, passedByHuman, humanChopsticksMode: false };
  }

  return endRound({ ...state, players, passedByHuman, humanChopsticksMode: false });
}

function endRound(state: GameState): GameState {
  const makiBonus = scoreMaki(state.players);

  const players = state.players.map((p) => {
    const base = scoreCollection(p.collection);
    const roundScore = base + (makiBonus[p.id] ?? 0);
    const puddings = [...p.puddings, ...p.collection.filter((c) => c.type === "pudding")];
    return {
      ...p,
      puddings,
      roundScores: [...p.roundScores, roundScore],
      totalScore: p.totalScore + roundScore,
    };
  });

  if (state.round >= 3) {
    const puddingBonus = scorePudding(players);
    const finalPlayers = players.map((p) => ({
      ...p,
      totalScore: p.totalScore + (puddingBonus[p.id] ?? 0),
    }));
    return { ...state, players: finalPlayers, phase: "game-end" };
  }

  return { ...state, players, phase: "round-end" };
}

export function startNextRound(state: GameState): GameState {
  return dealRound(state);
}
