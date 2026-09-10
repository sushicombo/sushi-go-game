/**
 * Headless tier ladder check: seat 0 plays `challenger`, every other seat plays `field`.
 * Run with:  npx tsx lib/tournament.ts
 */
import { createGame, playTurn, startNextRound } from "./game";
import { decideBotMove } from "./bot";
import { Difficulty, GameState } from "./types";

function driveSeatZero(state: GameState, tier: Difficulty) {
  const n = state.players.length;
  const me = state.players[0];
  const downstream = Array.from({ length: n - 1 }, (_, k) => state.players[(1 + k) % n]);
  const move = decideBotMove(me, state.players.slice(1), tier, {
    turnsLeft: me.hand.length,
    handSize: state.handSize,
    round: state.round,
    downstream,
    seen: [...state.players.flatMap((p) => p.collection), ...me.hand],
  });
  return { cardIds: move.cards.map((c) => c.id), useChopsticks: move.useChopsticks };
}

function playGame(players: number, challenger: Difficulty, field: Difficulty) {
  let state = createGame(players, field);
  while (state.phase !== "game-end") {
    if (state.phase === "round-end") {
      state = startNextRound(state);
      continue;
    }
    state = playTurn(state, driveSeatZero(state, challenger));
  }
  const scores = state.players.map((p) => p.totalScore);
  const mine = scores[0];
  const best = Math.max(...scores);
  const shared = scores.filter((s) => s === best).length;
  return { mine, others: scores.slice(1), won: mine === best, sharedWin: mine === best && shared > 1 };
}

function match(challenger: Difficulty, field: Difficulty, games = 400, players = 4) {
  let wins = 0;
  let mineTotal = 0;
  let fieldTotal = 0;
  let fieldCount = 0;
  for (let i = 0; i < games; i++) {
    const r = playGame(players, challenger, field);
    if (r.won) wins += r.sharedWin ? 0.5 : 1;
    mineTotal += r.mine;
    fieldTotal += r.others.reduce((a, b) => a + b, 0);
    fieldCount += r.others.length;
  }
  return {
    label: `${challenger} vs ${field}`,
    winRate: (wins / games) * 100,
    avgSelf: mineTotal / games,
    avgField: fieldTotal / fieldCount,
  };
}

function report(title: string, pairs: [Difficulty, Difficulty][]) {
  console.log(`\n${title}`);
  console.log("matchup".padEnd(26), "win%".padStart(7), "avg self".padStart(10), "avg field".padStart(11));
  for (const [a, b] of pairs) {
    const r = match(a, b);
    console.log(
      r.label.padEnd(26),
      r.winRate.toFixed(1).padStart(7),
      r.avgSelf.toFixed(1).padStart(10),
      r.avgField.toFixed(1).padStart(11)
    );
  }
}

console.log("seat 0 = challenger, other 3 seats = field, 400 games each. 25% win rate is neutral.");

// Each tier should beat the one below it.
report("LADDER — each tier against the one below", [
  ["normal", "easy"],
  ["hard", "normal"],
  ["very-hard", "hard"],
  ["extreme", "very-hard"],
]);

// The metric that actually matters: one fixed player facing a table of each tier.
// Lower win% means a harder table to sit at.
report("DIFFICULTY FELT — a fixed 'hard' player facing each field", [
  ["hard", "easy"],
  ["hard", "normal"],
  ["hard", "hard"],
  ["hard", "very-hard"],
  ["hard", "extreme"],
]);
