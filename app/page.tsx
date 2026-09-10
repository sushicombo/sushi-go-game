"use client";

import { useEffect, useState } from "react";
import { GameState, Difficulty } from "@/lib/types";
import { createGame, playTurn, startNextRound } from "@/lib/game";
import { saveGame, loadGame, clearGame } from "@/lib/storage";
import { Setup } from "@/components/Setup";
import { GameBoard } from "@/components/GameBoard";
import { RoundSummary } from "@/components/RoundSummary";

export default function Home() {
  const [state, setState] = useState<GameState | null>(null);
  const [thinking, setThinking] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setState(loadGame());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (state) saveGame(state);
    else clearGame();
  }, [state, loaded]);

  if (!loaded) return null;

  function handleStart(numPlayers: number, difficulty: Difficulty) {
    setState(createGame(numPlayers, difficulty));
  }

  function handlePlay(cardIds: string[], useChopsticks: boolean) {
    if (!state) return;
    setThinking(true);
    setTimeout(() => {
      setState(playTurn(state, { cardIds, useChopsticks }));
      setThinking(false);
    }, 700);
  }

  function handleNext() {
    if (!state) return;
    if (state.phase === "game-end") {
      setState(null);
      return;
    }
    setState(startNextRound(state));
  }

  function handleRestart() {
    setState(null);
  }

  return (
    <main className="min-h-screen">
      {!state && <Setup onStart={handleStart} />}
      {state && state.phase === "playing" && (
        <GameBoard state={state} onPlay={handlePlay} thinking={thinking} onRestart={handleRestart} />
      )}
      {state && (state.phase === "round-end" || state.phase === "game-end") && (
        <RoundSummary state={state} onNext={handleNext} onRestart={handleRestart} />
      )}
    </main>
  );
}
