"use client";

import { Card as CardT, CardType } from "@/lib/types";
import { CARD_META } from "@/lib/cardMeta";
import { CardIcon } from "./icons";

/** A card in hand: rice-paper face on the cedar rail, the only thing that lifts off the tray. */
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
      className={`group relative flex h-[7.5rem] w-[4.75rem] shrink-0 flex-col items-center justify-start gap-1 rounded-xl px-1.5 pt-2 pb-1.5 transition-[transform,box-shadow] duration-200 ease-out sm:h-[9.75rem] sm:w-[7.25rem] sm:gap-1.5 sm:rounded-2xl sm:px-2.5 sm:pt-3 sm:pb-2.5 ${
        selected ? "-translate-y-3" : interactive ? "hover:-translate-y-1.5" : ""
      } ${interactive ? "cursor-pointer" : "cursor-default"} ${disabled ? "opacity-55" : ""}`}
      style={{
        background: "linear-gradient(180deg, #fffaf0 0%, #f6e9cf 100%)",
        boxShadow: selected
          ? "0 10px 22px rgba(120,90,50,0.35), 0 0 0 2px #e0b64a"
          : "0 4px 10px rgba(120,90,50,0.22), 0 0 0 1px rgba(92,64,51,0.14)",
      }}
    >
      <CardIcon type={card.type} className="h-10 w-10 sm:h-14 sm:w-14" />
      <span className="display text-[0.72rem] font-bold leading-none sm:text-[0.92rem]" style={{ color: "#6b4534" }}>
        {meta.label.replace(" Nigiri", "")}
      </span>
      <span className="text-[0.56rem] font-medium leading-none tracking-tight sm:text-[0.68rem]" style={{ color: meta.accent }}>
        {meta.rule}
      </span>
    </button>
  );
}

/** A collection entry inside a well: one plate, counted. */
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
      className={`flex items-center gap-1 rounded-md ${large ? "px-2 py-1.5" : "px-1.5 py-1"} ${fresh ? "seat" : ""}`}
      style={{ background: "rgba(58,42,34,0.05)", boxShadow: "inset 0 0 0 1px rgba(176,138,94,0.28)" }}
      title={`${meta.label} ×${count}`}
    >
      <CardIcon type={type} className={large ? "h-8 w-8" : "h-6 w-6"} />
      <span
        className={`display font-bold leading-none ${large ? "text-base" : "text-sm"}`}
        style={{ color: count > 0 ? "var(--rice)" : "var(--rice-dim)" }}
      >
        {count}
      </span>
    </div>
  );
}
