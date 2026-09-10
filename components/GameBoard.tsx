"use client";

import { useMemo, useState } from "react";
import { Card, CardType, GameState, Player } from "@/lib/types";
import { ORDER } from "@/lib/cardMeta";
import { makiIconCount, scoreCollection } from "@/lib/scoring";
import { isAlarming, threats } from "@/lib/analysis";
import { CardView, PlateChip } from "./Card";

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
    <div className="flex items-center gap-4">
      {/* Three rounds as three plush pips; the current one fills coral. */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((r) => (
          <span
            key={r}
            className="display flex h-8 w-8 items-center justify-center rounded-full text-sm leading-none font-bold sm:h-9 sm:w-9 sm:text-base"
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
      <div className="flex items-center gap-1" aria-label={`${handLeft} of ${handSize} cards left in hand`}>
        {Array.from({ length: handSize }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full transition-colors duration-300"
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
  className = "",
}: {
  player: Player;
  showThreats: boolean;
  thinking?: boolean;
  own?: boolean;
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
    >
      <header className="flex items-center justify-between gap-2">
        <h3
          className={`display truncate leading-none font-bold ${own ? "text-xl" : "text-sm"}`}
          style={{ color: "var(--ink)" }}
        >
          {player.name}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
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
            className={`display flex items-center justify-center rounded-full leading-none font-bold ${
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
        {!own && plates.map((p) => <PlateChip key={p.type} type={p.type} count={p.count} />)}
      </div>

      {/* Your own board: countable plates on a phone, full card faces where there is room. */}
      {own && (
        <>
          <div className="flex flex-wrap gap-1.5 sm:hidden">
            {plates.map((p) => (
              <PlateChip key={p.type} type={p.type} count={p.count} large />
            ))}
          </div>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {sortForDisplay(player.collection).map((c) => (
              <CardView key={c.id} card={c} />
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
    onPlay(isFinalCard ? [human.hand[0].id] : selected, chopsticksMode);
    setSelected([]);
    setChopsticksMode(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-6">
        <RoundSpine round={state.round} handLeft={human.hand.length} handSize={state.handSize} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start a new game? This ends the current one.")) onRestart();
            }}
            className="rounded-full px-3.5 py-2 text-[0.7rem] font-bold tracking-wide uppercase"
            style={{ color: "var(--ink-soft)", boxShadow: "inset 0 0 0 2.5px var(--ink-faint)" }}
          >
            Start over
          </button>
          <button
            type="button"
            onClick={() => setShowThreats((v) => !v)}
            className="rounded-full px-3.5 py-2 text-[0.7rem] font-bold tracking-wide uppercase"
            style={{
              color: showThreats ? "var(--on-coral)" : "var(--ink-soft)",
              background: showThreats ? "var(--coral)" : "transparent",
              boxShadow: `inset 0 0 0 2.5px ${showThreats ? "var(--ink)" : "var(--ink-faint)"}`,
            }}
            aria-pressed={showThreats}
          >
            Threat read {showThreats ? "on" : "off"}
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-start gap-2.5 px-4 pt-1 pb-4 sm:gap-3 sm:px-6">
        <div className="flex flex-1 flex-col gap-2 sm:gap-3">
          <div className={`grid gap-2 sm:gap-3 ${oppCols}`}>
            {opponents.map((p, i) => (
              <Well
                key={p.id}
                player={p}
                showThreats={showThreats}
                thinking={thinking}
                className={i === opponents.length - 1 && opponents.length % 2 === 1 ? "col-span-2 sm:col-span-1" : ""}
              />
            ))}
          </div>

          <Well player={human} showThreats={showThreats} own />
        </div>
      </main>

      <footer className="rail sticky bottom-0 flex flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3">
          <p className="display text-sm font-bold" style={{ color: "var(--ink)" }}>
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
              className="rounded-full px-3.5 py-2 text-[0.7rem] font-bold tracking-wide uppercase disabled:opacity-50"
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

        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-end">
          <div className="-mx-1 flex flex-1 flex-wrap gap-2 px-1 pt-3 pb-1 sm:flex-nowrap sm:overflow-x-auto">
            {human.hand.map((c) => (
              <CardView
                key={c.id}
                card={c}
                selected={selected.includes(c.id)}
                onClick={() => toggleCard(c.id)}
                disabled={thinking || isFinalCard}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={confirm}
            disabled={!ready || thinking}
            className="btn display mb-1 w-full shrink-0 px-5 py-3.5 text-base font-bold sm:w-auto sm:self-center sm:px-8"
          >
            {thinking ? "…" : isFinalCard ? "Take it" : "Serve"}
          </button>
        </div>
      </footer>
    </div>
  );
}
