"use client";

import { GameState } from "@/lib/types";
import { scoreBreakdown, makiIconCount, scoreMaki, scorePudding } from "@/lib/scoring";
import { debrief } from "@/lib/analysis";
import { CardIcon } from "./icons";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function RoundSummary({
  state,
  onNext,
  onRestart,
}: {
  state: GameState;
  onNext: () => void;
  onRestart: () => void;
}) {
  const isGameEnd = state.phase === "game-end";
  const ranked = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
  const maki = scoreMaki(state.players);
  const pudding = isGameEnd ? scorePudding(state.players) : null;
  const coaching = debrief(state);
  const roundIndex = state.round - 1;

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-3xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="display text-5xl leading-none font-black tracking-tight sm:text-6xl" style={{ color: "var(--ink)" }}>
            {isGameEnd ? "Dessert" : `Round ${["I", "II", "III"][roundIndex]} scored`}
          </h2>
          {!isGameEnd && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Start a new game? This ends the current one.")) onRestart();
              }}
              className="mt-2 shrink-0 rounded-full px-3.5 py-2 text-[0.7rem] font-bold tracking-wide uppercase"
              style={{ color: "var(--ink-soft)", boxShadow: "inset 0 0 0 2.5px var(--ink-faint)" }}
            >
              Start over
            </button>
          )}
        </div>

        {isGameEnd && (
          <p className="mt-3 text-base" style={{ color: "var(--ink-soft)" }}>
            <span className="display text-xl font-bold" style={{ color: "var(--coral)" }}>
              {ranked[0].name}
            </span>{" "}
            {ranked[0].id === "human" ? "took it" : "took it"} with {fmt(ranked[0].totalScore)}.
          </p>
        )}

        <div className="my-6 h-[3px] rounded-full" style={{ background: "var(--ink)" }} />

        <div className="plush overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr style={{ color: "var(--ink-soft)" }}>
                {["", "Nigiri", "Temp.", "Sashimi", "Dump.", "Maki", ...(isGameEnd ? ["Pud."] : []), "Round", "Total"].map(
                  (h, i) => (
                    <th
                      key={h + i}
                      className={`px-2 py-2.5 text-[0.62rem] font-semibold tracking-[0.1em] uppercase ${
                        i === 0 ? "text-left" : "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {ranked.map((p) => {
                const b = scoreBreakdown(p.collection);
                const roundScore = p.roundScores[roundIndex] ?? 0;
                return (
                  <tr key={p.id} style={{ borderTop: "2px solid var(--well)" }}>
                    <td
                      className="display px-2 py-2.5 text-left font-bold whitespace-nowrap"
                      style={{ color: p.id === "human" ? "var(--ink)" : "var(--ink-soft)" }}
                    >
                      {p.name}
                    </td>
                    {[b.nigiri, b.tempura, b.sashimi, b.dumpling].map((v, i) => (
                      <td
                        key={i}
                        className="px-2 py-2.5 text-right"
                        style={{ color: v > 0 ? "var(--ink)" : "var(--ink-faint)" }}
                      >
                        {v}
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-right" style={{ color: maki[p.id] > 0 ? "var(--ink)" : "var(--ink-faint)" }}>
                      {fmt(maki[p.id])}
                      <span className="block text-[0.62rem] leading-tight" style={{ color: "var(--ink-soft)" }}>
                        {makiIconCount(p.collection)} rolls
                      </span>
                    </td>
                    {isGameEnd && pudding && (
                      <td
                        className="px-2 py-2.5 text-right"
                        style={{ color: pudding[p.id] < 0 ? "var(--coral-deep)" : "var(--ink)" }}
                      >
                        {pudding[p.id] > 0 ? "+" : ""}
                        {fmt(pudding[p.id])}
                      </td>
                    )}
                    <td className="px-2 py-2.5 text-right font-bold" style={{ color: "var(--ink)" }}>
                      {fmt(roundScore)}
                    </td>
                    <td className="display px-2 py-2.5 text-right text-lg font-bold" style={{ color: "var(--coral)" }}>
                      {fmt(p.totalScore)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(coaching.gifts.length > 0 || coaching.leftOnTable.length > 0 || coaching.races.length > 0) && (
          <section className="mt-7">
            <h3 className="display text-2xl font-black" style={{ color: "var(--ink)" }}>
              What that round cost you
            </h3>

            {coaching.gifts.length > 0 && (
              <div className="mt-4">
                <p className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--ink-soft)" }}>
                  Cards you passed
                </p>
                <ul className="mt-2 flex flex-col">
                  {coaching.gifts.map((g, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 py-2.5"
                      style={{ borderTop: i === 0 ? "none" : "2px solid var(--well)" }}
                    >
                      <CardIcon type={g.cardType} className="h-8 w-8 shrink-0" />
                      <span className="flex-1 text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>
                        <span className="font-semibold" style={{ color: "var(--ink)" }}>
                          {g.takerName}
                        </span>{" "}
                        took {g.count > 1 ? `${g.count} ` : "the "}
                        {g.cardLabel}
                        {g.count > 1 ? "s" : ""} you passed{g.note ? ` — ${g.note}` : ""}.
                      </span>
                      {g.points > 0 && (
                        <span className="display shrink-0 text-lg font-bold" style={{ color: "var(--coral-deep)" }}>
                          +{g.points}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.leftOnTable.length > 0 && (
              <div className="mt-5">
                <p className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--ink-soft)" }}>
                  Left unfinished
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {coaching.leftOnTable.map((l, i) => (
                    <li key={i} className="text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {l.label}.
                      </span>{" "}
                      {l.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coaching.races.length > 0 && (
              <div className="mt-5">
                <p className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--ink-soft)" }}>
                  Races
                </p>
                <ul className="mt-2 flex flex-col gap-2">
                  {coaching.races.map((r, i) => (
                    <li key={i} className="text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>
                      <span className="font-semibold" style={{ color: "var(--ink)" }}>
                        {r.label}.
                      </span>{" "}
                      {r.detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={onNext}
          className="btn display mt-8 mb-1 w-full py-4 text-lg font-bold"
        >
          {isGameEnd ? "Play again" : `Deal round ${["I", "II", "III"][roundIndex + 1]}`}
        </button>
      </div>
    </div>
  );
}
