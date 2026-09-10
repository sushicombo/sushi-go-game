"use client";

import { useState } from "react";
import { Difficulty } from "@/lib/types";

const DIFFICULTY_NOTE: Record<Difficulty, string> = {
  easy: "Drafts at random. Good for learning the shape of a round.",
  normal: "Plays its own board greedily — completes sets, takes the tripled nigiri.",
  hard: "Adds the roll race and knows when a set can no longer finish before the round ends.",
  "very-hard": "Counts every card played, so it knows what is left. Drafts to starve the seat on its left.",
  extreme: "All of that, harder — and it reads chopsticks as a two-card play. This is the friend who beat you.",
};

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard", "very-hard", "extreme"];

export function Setup({ onStart }: { onStart: (numPlayers: number, difficulty: Difficulty) => void }) {
  const [numPlayers, setNumPlayers] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <h1 className="display text-7xl leading-[0.9] font-black tracking-tight sm:text-8xl" style={{ color: "var(--ink)" }}>
          Sushi
          <span style={{ color: "var(--coral)" }}> Combo</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Three rounds. Everything you pass goes to the player on your left. Learn to read what they
          are collecting before they finish it.
        </p>

        <div className="my-7 h-[3px] rounded-full" style={{ background: "var(--ink)" }} />

        <fieldset>
          <legend className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--ink-soft)" }}>
            Seats at the table
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumPlayers(n)}
                aria-pressed={numPlayers === n}
                className="flex flex-col items-center gap-1 rounded-2xl py-3 transition-transform"
                style={{
                  background: numPlayers === n ? "var(--coral)" : "var(--card)",
                  boxShadow: `inset 0 0 0 3px var(--ink), 0 ${numPlayers === n ? 2 : 5}px 0 var(--ink)`,
                  transform: numPlayers === n ? "translateY(3px)" : undefined,
                }}
              >
                <span
                  className="display text-2xl font-bold leading-none"
                  style={{ color: numPlayers === n ? "var(--on-coral)" : "var(--ink)" }}
                >
                  {n}
                </span>
                <span className="text-[0.62rem]" style={{ color: numPlayers === n ? "var(--on-coral)" : "var(--ink-soft)" }}>
                  {n === 3 ? "9 cards" : n === 4 ? "8 cards" : "7 cards"}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--ink-soft)" }}>
            How the bots play
          </legend>
          <div className="mt-3 flex flex-col gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                className="flex flex-col gap-1 rounded-2xl px-4 py-3 text-left transition-transform"
                style={{
                  background: difficulty === d ? "var(--coral)" : "var(--card)",
                  boxShadow: `inset 0 0 0 3px var(--ink), 0 ${difficulty === d ? 2 : 5}px 0 var(--ink)`,
                  transform: difficulty === d ? "translateY(3px)" : undefined,
                }}
              >
                <span
                  className="display text-base font-bold capitalize leading-none"
                  style={{ color: difficulty === d ? "var(--on-coral)" : "var(--ink)" }}
                >
                  {d.replace("-", " ")}
                </span>
                <span
                  className="text-[0.72rem] leading-snug"
                  style={{ color: difficulty === d ? "var(--on-coral)" : "var(--ink-soft)" }}
                >
                  {DIFFICULTY_NOTE[d]}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => onStart(numPlayers, difficulty)}
          className="btn display mt-8 mb-1 w-full py-4 text-lg font-bold"
        >
          Deal the first round
        </button>
      </div>
    </div>
  );
}
