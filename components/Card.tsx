"use client";

import { Card as CardT, CardType } from "@/lib/types";
import { CARD_META } from "@/lib/cardMeta";
import { CardIcon } from "./icons";

/** A card in hand: a plush cream tile on an ink block. Selecting it lifts the tile off the block. */
export function CardView({
  card,
  selected,
  onClick,
  disabled,
}: {
  card: CardT;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const meta = CARD_META[card.type];
  const interactive = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      data-card={card.type}
      aria-pressed={selected}
      className={`plush group relative flex h-[7.5rem] w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 px-1.5 py-2 transition-transform duration-150 ease-out sm:h-[9.75rem] sm:w-[7.25rem] sm:gap-1.5 sm:px-2.5 sm:py-3 ${
        selected ? "-translate-y-3" : interactive ? "hover:-translate-y-1.5" : ""
      } ${interactive ? "cursor-pointer" : "cursor-default"} ${disabled ? "opacity-50" : ""}`}
      style={
        selected
          ? { boxShadow: "inset 0 0 0 4px var(--coral), 0 12px 0 rgba(47,62,68,0.22)" }
          : undefined
      }
    >
      <CardIcon type={card.type} className="h-10 w-10 sm:h-14 sm:w-14" />
      <span className="display text-[0.72rem] leading-none font-bold sm:text-[0.92rem]" style={{ color: "var(--ink)" }}>
        {meta.label.replace(" Nigiri", "")}
      </span>
      <span
        className="text-[0.56rem] leading-none font-bold tracking-tight sm:text-[0.68rem]"
        style={{ color: meta.accent }}
      >
        {meta.rule}
      </span>
    </button>
  );
}

/** A collection entry inside a well: one plush plate, counted. */
export function PlateChip({
  type,
  count,
  large,
  fresh,
}: {
  type: CardType;
  count: number;
  large?: boolean;
  fresh?: boolean;
}) {
  const meta = CARD_META[type];
  return (
    <div
      className={`flex items-center gap-1 rounded-xl ${large ? "px-2 py-1.5" : "px-1.5 py-1"} ${fresh ? "seat" : ""}`}
      style={{ background: "var(--card)", boxShadow: "inset 0 0 0 2.5px var(--ink)" }}
      title={`${meta.label} ×${count}`}
    >
      {/* h-6 / h-8 flip the icon set to its simplified small art. */}
      <CardIcon type={type} className={large ? "h-8 w-8" : "h-6 w-6"} />
      <span
        className={`display leading-none font-bold ${large ? "text-base" : "text-sm"}`}
        style={{ color: count > 0 ? "var(--ink)" : "var(--ink-faint)" }}
      >
        {count}
      </span>
    </div>
  );
}
