"use client";

import { CSSProperties, useMemo, useState } from "react";
import { Card, CardType, GameState, Player } from "@/lib/types";
import { ORDER } from "@/lib/cardMeta";
import { makiIconCount, scoreCollection } from "@/lib/scoring";
import { isAlarming, threats } from "@/lib/analysis";
import { CardView, PlateChip } from "./Card";
import { StartOver } from "./StartOver";

function group(cards: Card[]): { type: CardType; count: number }[] {
  const counts = new Map<CardType, number>();
  for (const c of cards) counts.set(c.type, (counts.get(c.type) ?? 0) + 1);
  return ORDER.filter((t) => counts.has(t)).map((t) => ({ type: t, count: counts.get(t) as number }));
}

/** Sets sit next to their own kind, so a pair or a triple is countable at a glance. */
function sortForDisplay(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
}

function RoundSpine({ round, handLeft, handSize }: { round: number; handLeft: number; handSize: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
      {/* Three rounds as three plush pips; the current one fills coral. */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        {[1, 2, 3].map((r) => (
          <span
            key={r}
            className="display flex h-7 w-7 items-center justify-center rounded-full text-xs leading-none font-bold sm:h-9 sm:w-9 sm:text-base"
            style={{
              background: r === round ? "var(--coral)" : r < round ? "var(--card)" : "transparent",
              color: r === round ? "var(--on-coral)" : r < round ? "var(--ink)" : "var(--ink-faint)",
              boxShadow: `inset 0 0 0 3px ${r > round ? "var(--ink-faint)" : "var(--ink)"}`,
            }}
          >
            {["I", "II", "III"][r - 1]}
          </span>
        ))}
      </div>
      {/* The hand visibly depletes: one bead per card still to draft. */}
      <div className="flex min-w-0 flex-wrap items-center gap-1" aria-label={`${handLeft} of ${handSize} cards left in hand`}>
        {Array.from({ length: handSize }).map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full transition-colors duration-300 sm:h-2.5 sm:w-2.5"
            style={{
              background: i < handLeft ? "var(--ink)" : "transparent",
              boxShadow: i < handLeft ? "none" : "inset 0 0 0 2px var(--ink-faint)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Well({
  player,
  showThreats,
  thinking,
  own,
  seatDelay = 0,
  className = "",
}: {
  player: Player;
  showThreats: boolean;
  thinking?: boolean;
  own?: boolean;
  seatDelay?: number;
  className?: string;
}) {
  const plates = group(player.collection);
  const maki = makiIconCount(player.collection);
  const alerts = showThreats ? threats(player.collection) : [];
  const provisional = scoreCollection(player.collection);
  // Union by id: at round-end the round's puddings live in both lists.
  const puddings = new Set(
    [...player.puddings, ...player.collection.filter((c) => c.type === "pudding")].map((c) => c.id)
  ).size;

  return (
    <section
      className={`flex flex-col ${own ? "flex-1 gap-3 p-4" : "gap-2 p-3"} ${
        isAlarming(alerts) ? "well well-threat" : "well"
      } ${className}`}
      style={{ "--seat-delay": `${seatDelay}ms` } as CSSProperties}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h3
          className={`display min-w-0 truncate leading-none font-bold ${own ? "text-lg sm:text-xl" : "text-sm"}`}
          style={{ color: "var(--ink)" }}
        >
          {player.name}
        </h3>
        <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
          {maki > 0 && (
            <span className="text-[0.65rem] font-bold" style={{ color: "var(--ink-soft)" }}>
              {maki} maki
            </span>
          )}
          {puddings > 0 && (
            <span className="text-[0.65rem] font-bold" style={{ color: "var(--ink-soft)" }}>
              {puddings} pud
            </span>
          )}
          {player.totalScore > 0 && (
            <span className="text-[0.65rem] font-bold" style={{ color: "var(--ink-soft)" }}>
              {player.totalScore} banked
            </span>
          )}
          {/* The running score is the one numeral that always reads: a filled ink pill. */}
          <span
            key={provisional}
            className={`pop display flex items-center justify-center rounded-full leading-none font-bold ${
              own ? "h-9 min-w-9 px-2 text-lg" : "h-7 min-w-7 px-1.5 text-sm"
            }`}
            style={{
              background: provisional > 0 ? "var(--ink)" : "transparent",
              color: provisional > 0 ? "var(--card)" : "var(--ink-faint)",
              boxShadow: provisional > 0 ? "none" : "inset 0 0 0 2.5px var(--ink-faint)",
            }}
            title="Points on the table this round, before maki and pudding"
          >
            {provisional}
          </span>
        </div>
      </header>

      <div className={`flex flex-wrap ${own ? "gap-2" : "gap-1"}`}>
        {player.collection.length === 0 && (
          <span className="text-[0.7rem] font-semibold" style={{ color: "var(--ink-faint)" }}>
            {thinking ? "drafting…" : own ? "nothing on your plate yet" : "empty"}
          </span>
        )}
        {!own && plates.map((p) => <PlateChip key={`${p.type}${p.count}`} type={p.type} count={p.count} fresh />)}
      </div>

      {/* Your own board: countable plates on a phone, full card faces where there is room. */}
      {own && (
        <>
          <div className="flex flex-wrap gap-1.5 sm:hidden">
            {plates.map((p) => (
              <PlateChip key={`${p.type}${p.count}`} type={p.type} count={p.count} large fresh />
            ))}
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {sortForDisplay(player.collection).map((c) => (
              <span key={c.id} className="seat">
                <CardView card={c} />
              </span>
            ))}
          </div>
        </>
      )}

      {alerts.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {alerts.map((a) => (
            <li key={a.label} className="flex items-center gap-1.5 text-[0.68rem] font-bold">
              <span
                className={`h-2 w-2 rounded-full ${a.points >= 9 ? "lamp" : ""}`}
                style={{ background: a.points >= 9 ? "var(--coral)" : "var(--ink-faint)" }}
              />
              <span style={{ color: a.points >= 9 ? "var(--coral-deep)" : "var(--ink-soft)" }}>
                {a.label} <span style={{ color: "var(--ink-faint)" }}>+{a.points}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function GameBoard({
  state,
  onPlay,
  thinking,
  onRestart,
}: {
  state: GameState;
  onPlay: (cardIds: string[], useChopsticks: boolean) => void;
  thinking: boolean;
  onRestart: () => void;
}) {
  const human = state.players[0];
  const opponents = state.players.slice(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [chopsticksMode, setChopsticksMode] = useState(false);
  // Held through the pass so the served cards animate onto the tray while the
  // rest of the hand travels left.
  const [served, setServed] = useState<string[]>([]);
  const [combo, setCombo] = useState(false);
  const [showThreats, setShowThreats] = useState(true);

  const hasChopsticks = human.collection.some((c) => c.type === "chopsticks");
  const isFinalCard = human.hand.length === 1;
  const need = isFinalCard ? 1 : chopsticksMode ? 2 : 1;
  const ready = isFinalCard || selected.length === need;

  const oppCols = useMemo(
    () => (opponents.length <= 2 ? "grid-cols-2" : opponents.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"),
    [opponents.length]
  );

  function toggleCard(id: string) {
    if (isFinalCard || thinking) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= need) return need === 1 ? [id] : prev;
      return [...prev, id];
    });
  }

  function confirm() {
    if (!ready || thinking) return;
    const ids = isFinalCard ? [human.hand[0].id] : selected;
    setServed(ids);
    setCombo(chopsticksMode && ids.length === 2);
    onPlay(ids, chopsticksMode);
    setSelected([]);
    setChopsticksMode(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-x-2 gap-y-2 px-3 pt-3 pb-2 sm:gap-3 sm:px-6 sm:pt-4 sm:pb-3">
        <RoundSpine round={state.round} handLeft={human.hand.length} handSize={state.handSize} />
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <StartOver onRestart={onRestart} />
          <button
            type="button"
            onClick={() => setShowThreats((v) => !v)}
            className="shrink-0 rounded-full px-2.5 py-1.5 text-[0.62rem] font-bold tracking-wide whitespace-nowrap uppercase sm:px-3.5 sm:py-2 sm:text-[0.7rem]"
            style={{
              color: showThreats ? "var(--on-coral)" : "var(--ink-soft)",
              background: showThreats ? "var(--coral)" : "transparent",
              boxShadow: `inset 0 0 0 2.5px ${showThreats ? "var(--ink)" : "var(--ink-faint)"}`,
            }}
            aria-pressed={showThreats}
          >
            <span className="hidden sm:inline">Threat read </span>
            <span className="sm:hidden">Threats </span>
            {showThreats ? "on" : "off"}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-start gap-2.5 px-3 pt-1 pb-3 sm:gap-3 sm:px-6 sm:pb-4">
        <div className="flex flex-1 flex-col gap-2 sm:gap-3">
          <div className={`grid gap-2 sm:gap-3 ${oppCols}`}>
            {opponents.map((p, i) => (
              <Well
                key={p.id}
                player={p}
                showThreats={showThreats}
                thinking={thinking}
                seatDelay={(i + 1) * 90}
                className={i === opponents.length - 1 && opponents.length % 2 === 1 ? "col-span-2 sm:col-span-1" : ""}
              />
            ))}
          </div>

          <Well player={human} showThreats={showThreats} own />
        </div>
      </main>

      <footer className="rail sticky bottom-0 relative flex flex-col gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        {thinking && combo && (
          <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 sm:-top-10" aria-hidden>
            <span
              className="stamp display block rounded-full px-6 py-2 text-2xl font-black tracking-wide uppercase sm:px-8 sm:py-2.5 sm:text-4xl"
              style={{
                background: "var(--coral)",
                color: "var(--on-coral)",
                boxShadow: "inset 0 0 0 4px var(--ink), 0 6px 0 var(--ink)",
              }}
            >
              Combo!
            </span>
          </span>
        )}
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3">
          <p className="display text-xs font-bold sm:text-sm" style={{ color: "var(--ink)" }}>
            {isFinalCard
              ? "Last card — it goes straight to your tray"
              : chopsticksMode
                ? `Choose two (${selected.length}/2)`
                : "Choose one"}
          </p>
          {hasChopsticks && !isFinalCard && (
            <button
              type="button"
              onClick={() => {
                setChopsticksMode((v) => !v);
                setSelected([]);
              }}
              disabled={thinking}
              className="shrink-0 rounded-full px-2.5 py-1.5 text-[0.62rem] font-bold tracking-wide whitespace-nowrap uppercase disabled:opacity-50 sm:px-3.5 sm:py-2 sm:text-[0.7rem]"
              style={{
                color: chopsticksMode ? "var(--on-coral)" : "var(--ink)",
                background: chopsticksMode ? "var(--coral)" : "var(--well)",
                boxShadow: "inset 0 0 0 2.5px var(--ink)",
              }}
              aria-pressed={chopsticksMode}
            >
              Sushi Combo <span className="hidden sm:inline">— use chopsticks</span>
              <span className="sm:hidden">— take two</span>
            </button>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          {/* Re-keyed on the hand's identity: the hand passed to you mounts fresh
              and arrives from the right, while the one you passed is still leaving. */}
          <div
            key={human.hand.map((c) => c.id).join()}
            className="hand-rail -mx-1 flex flex-1 flex-nowrap gap-2 overflow-x-auto overscroll-x-contain px-1 pt-3 pb-1"
          >
            {human.hand.map((c, i) => (
              <span
                key={c.id}
                className={`shrink-0 ${thinking ? (served.includes(c.id) ? "serve-up" : "pass-out") : "pass-in"}`}
                style={{ "--i": i } as CSSProperties}
              >
                <CardView
                  card={c}
                  selected={selected.includes(c.id)}
                  onClick={() => toggleCard(c.id)}
                  disabled={thinking || isFinalCard}
                />
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={!ready || thinking}
            className="btn display mb-1 w-full shrink-0 px-5 py-3 text-base font-bold sm:w-auto sm:self-center sm:px-8 sm:py-3.5"
          >
            {thinking ? "…" : isFinalCard ? "Take it" : "Serve"}
          </button>
        </div>
      </footer>
    </div>
  );
}
