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
    <div className="flex items-center gap-5">
      <div className="flex items-baseline gap-2">
        {[1, 2, 3].map((r) => (
          <span
            key={r}
            className="display text-3xl leading-none sm:text-4xl"
            style={{
              color: r === round ? "var(--gold-bright)" : r < round ? "var(--cedar-pale)" : "rgba(138,115,96,0.35)",
              fontWeight: r === round ? 900 : 400,
            }}
          >
            {["I", "II", "III"][r - 1]}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-[3px]" aria-label={`${handLeft} of ${handSize} cards left in hand`}>
        {Array.from({ length: handSize }).map((_, i) => (
          <span
            key={i}
            className="h-3 w-[3px] rounded-full transition-colors duration-300"
            style={{ background: i < handLeft ? "var(--gold)" : "rgba(58,42,34,0.15)" }}
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
      className={`flex flex-col rounded-lg ${own ? "flex-1 gap-3 p-4 sm:flex-none" : "gap-2 p-3"} ${
        isAlarming(alerts) ? "well well-threat" : "well"
      } ${className}`}
    >
      <header className="flex items-baseline justify-between gap-2">
        <h3
          className={`display truncate font-bold leading-none ${own ? "text-xl" : "text-sm"}`}
          style={{ color: own ? "var(--rice)" : "var(--rice-dim)" }}
        >
          {player.name}
        </h3>
        <div className="flex shrink-0 items-baseline gap-2">
          {maki > 0 && (
            <span className="text-[0.65rem] font-semibold" style={{ color: "var(--cedar-pale)" }}>
              {maki} maki
            </span>
          )}
          {puddings > 0 && (
            <span className="text-[0.65rem] font-semibold" style={{ color: "var(--cedar-pale)" }}>
              {puddings} pud
            </span>
          )}
          {player.totalScore > 0 && (
            <span className="text-[0.65rem] font-semibold" style={{ color: "var(--cedar-pale)" }}>
              {player.totalScore} banked
            </span>
          )}
          <span
            className={`display font-bold leading-none ${own ? "text-2xl" : "text-base"}`}
            style={{ color: provisional > 0 ? "var(--gold-bright)" : "rgba(201,162,39,0.35)" }}
            title="Points on the table this round, before maki and pudding"
          >
            {provisional}
          </span>
        </div>
      </header>

      <div className={`flex flex-wrap ${own ? "gap-2" : "gap-1"}`}>
        {player.collection.length === 0 && (
          <span className="text-[0.7rem] italic" style={{ color: "rgba(138,115,96,0.6)" }}>
            {thinking ? "drafting…" : own ? "your compartment is empty" : "empty"}
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
            <li key={a.label} className="flex items-center gap-1.5 text-[0.68rem] font-semibold">
              <span
                className={`h-1.5 w-1.5 rounded-full ${a.points >= 9 ? "lamp" : ""}`}
                style={{ background: a.points >= 9 ? "var(--vermilion)" : "var(--cedar-pale)" }}
              />
              <span style={{ color: a.points >= 9 ? "var(--vermilion-text)" : "var(--rice-dim)" }}>
                {a.label} <span style={{ color: "var(--cedar-pale)" }}>+{a.points}</span>
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
    <div className="tray flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-6">
        <RoundSpine round={state.round} handLeft={human.hand.length} handSize={state.handSize} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start a new game? This ends the current one.")) onRestart();
            }}
            className="rounded-full px-3 py-1.5 text-[0.7rem] font-semibold tracking-wide uppercase transition-colors"
            style={{ color: "var(--rice-dim)", boxShadow: "inset 0 0 0 1px rgba(176,138,94,0.4)" }}
          >
            Start over
          </button>
          <button
            type="button"
            onClick={() => setShowThreats((v) => !v)}
            className="rounded-full px-3 py-1.5 text-[0.7rem] font-semibold tracking-wide uppercase transition-colors"
            style={{
              color: showThreats ? "var(--rice)" : "var(--rice-dim)",
              background: showThreats ? "var(--gold)" : "transparent",
              boxShadow: showThreats ? "none" : "inset 0 0 0 1px rgba(176,138,94,0.4)",
            }}
            aria-pressed={showThreats}
          >
            Threat read {showThreats ? "on" : "off"}
          </button>
        </div>
      </header>

      <div className="gold-rule mx-auto h-px w-full max-w-[1500px]" />

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-start gap-2.5 px-4 pt-2 pb-4 sm:gap-3 sm:px-6 sm:pt-3">
        <div className="tray-body flex flex-1 flex-col gap-2 rounded-2xl p-2.5 sm:flex-none sm:gap-3 sm:p-3.5">
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

      <footer className="rail sticky bottom-0 flex flex-col gap-3 px-4 py-3 sm:px-6" style={{ boxShadow: "0 -8px 24px rgba(0,0,0,0.5)" }}>
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3">
          <p className="display text-sm font-bold" style={{ color: "var(--rice)" }}>
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
              className="rounded-full px-3 py-1.5 text-[0.7rem] font-bold tracking-wide uppercase transition-colors disabled:opacity-50"
              style={{
                color: chopsticksMode ? "var(--accent-ink)" : "var(--rice)",
                background: chopsticksMode ? "var(--vermilion-fill)" : "rgba(58,42,34,0.08)",
              }}
              aria-pressed={chopsticksMode}
            >
              Sushi Go! <span className="hidden sm:inline">— use chopsticks</span>
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
            className="display w-full shrink-0 rounded-lg px-5 py-3.5 text-base font-bold transition-opacity disabled:opacity-40 sm:w-auto sm:self-center sm:px-7"
            style={{
              background: "var(--vermilion-fill)",
              color: "var(--accent-ink)",
              boxShadow: "0 3px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
            }}
          >
            {thinking ? "…" : isFinalCard ? "Take it" : "Serve"}
          </button>
        </div>
      </footer>
    </div>
  );
}
