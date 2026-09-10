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
    <div className="tray flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <h1 className="display text-7xl leading-[0.9] font-black tracking-tight sm:text-8xl" style={{ color: "var(--rice)" }}>
          Sushi
          <span style={{ color: "var(--vermilion-text)" }}> Go!</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--rice-dim)" }}>
          Three rounds. Everything you pass goes to the player on your left. Learn to read what they
          are collecting before they finish it.
        </p>

        <div className="gold-rule my-7 h-px" />

        <fieldset>
          <legend className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--cedar-pale)" }}>
            Seats at the table
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumPlayers(n)}
                aria-pressed={numPlayers === n}
                className="well flex flex-col items-center gap-1 rounded-lg py-3 transition-colors"
                style={
                  numPlayers === n
                    ? { background: "var(--vermilion-fill)", borderColor: "var(--vermilion)" }
                    : undefined
                }
              >
                <span
                  className="display text-2xl font-bold leading-none"
                  style={{ color: numPlayers === n ? "var(--accent-ink)" : "var(--rice)" }}
                >
                  {n}
                </span>
                <span className="text-[0.62rem]" style={{ color: numPlayers === n ? "rgba(240,231,212,0.75)" : "var(--rice-dim)" }}>
                  {n === 3 ? "9 cards" : n === 4 ? "8 cards" : "7 cards"}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--cedar-pale)" }}>
            How the bots play
          </legend>
          <div className="mt-3 flex flex-col gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                className="well flex flex-col gap-1 rounded-lg px-4 py-3 text-left transition-colors"
                style={
                  difficulty === d ? { background: "var(--vermilion-fill)", borderColor: "var(--vermilion)" } : undefined
                }
              >
                <span
                  className="display text-base font-bold capitalize leading-none"
                  style={{ color: difficulty === d ? "var(--accent-ink)" : "var(--rice)" }}
                >
                  {d.replace("-", " ")}
                </span>
                <span
                  className="text-[0.72rem] leading-snug"
                  style={{ color: difficulty === d ? "rgba(240,231,212,0.8)" : "var(--rice-dim)" }}
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
          className="display mt-7 w-full rounded-lg py-4 text-lg font-bold"
          style={{
            background: "var(--vermilion-fill)",
            color: "var(--accent-ink)",
            boxShadow: "0 3px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          Deal the first round
        </button>
      </div>
    </div>
  );
}
