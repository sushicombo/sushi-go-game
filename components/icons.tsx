import { CardType } from "@/lib/types";

const INK = "#5c4033";
const BLUSH = "#f5a3a0";

/** A closed happy-eye + blush face, stamped onto any plush shape at (cx, cy). */
function Face({ cx, cy, w = 9 }: { cx: number; cy: number; w?: number }) {
  return (
    <g>
      <path
        d={`M${cx - w} ${cy}q3 3 6 0M${cx + w - 6} ${cy}q3 3 6 0`}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx - w - 1} cy={cy + 4} r="2.6" fill={BLUSH} opacity="0.8" stroke="none" />
      <circle cx={cx + w + 1} cy={cy + 4} r="2.6" fill={BLUSH} opacity="0.8" stroke="none" />
    </g>
  );
}

/** One drawn set: 64x64 grid, soft plush fills, rounded strokes, a stamped face on each. */
export function CardIcon({ type, className = "w-10 h-10" }: { type: CardType; className?: string }) {
  const s = { stroke: INK, strokeWidth: 2.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  switch (type) {
    case "tempura":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="46" rx="24" ry="10" fill="#e8b978" {...s} />
          <path
            d="M14 44c-5-10 0-25 15-29 10-3 20 2 22 10 1 5-2 8-6 8-3-7-10-10-16-8-8 3-11 11-9 18"
            fill="#f3c98a"
            {...s}
          />
          <circle cx="22" cy="34" r="2.2" fill="#fbe6bf" stroke="none" />
          <circle cx="31" cy="26" r="1.8" fill="#fbe6bf" stroke="none" />
          <circle cx="16" cy="41" r="1.8" fill="#fbe6bf" stroke="none" />
          <Face cx={32} cy={45} />
        </svg>
      );

    case "sashimi":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M10 42l15-10 23 4-15 10z" fill="#f2929e" {...s} />
          <path d="M13 30l15-10 23 4-15 10z" fill="#f6a9b3" {...s} />
          <path d="M16 18l15-10 23 4-15 10z" fill="#facdd4" {...s} />
          <path d="M21 35l17 2M18 23l17 2" stroke="#fde3e7" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Face cx={32} cy={39} w={7} />
        </svg>
      );

    case "dumpling":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="48" rx="26" ry="6" fill="#f3a8a0" opacity="0.6" stroke="none" />
          <path d="M9 40c0-15 10-24 23-24s23 9 23 24c0 6-4 9-9 9H18c-5 0-9-3-9-9z" fill="#f4e3bf" {...s} />
          <path
            d="M18 46c1-9 3-14 5-16M32 46c0-10 1-15 2-18M46 46c-1-9-3-14-5-16"
            fill="none"
            stroke={INK}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity="0.6"
          />
          <path d="M9 40h46" fill="none" {...s} />
          <Face cx={32} cy={32} />
        </svg>
      );

    case "maki1":
    case "maki2":
    case "maki3": {
      const pips = { maki1: 1, maki2: 2, maki3: 3 }[type];
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <circle cx="32" cy="27" r="22" fill="#3a534c" {...s} />
          <circle cx="32" cy="27" r="15" fill="#faf1dd" {...s} />
          <circle cx="32" cy="27" r="6.5" fill="#f0894f" {...s} />
          <circle cx="26" cy="21" r="2.5" fill="#ffffff" opacity="0.35" stroke="none" />
          <Face cx={32} cy={27} w={9} />
          {Array.from({ length: pips }).map((_, i) => (
            <circle key={i} cx={32 + (i - (pips - 1) / 2) * 10} cy="57" r="3.6" fill="#3a534c" stroke="none" />
          ))}
        </svg>
      );
    }

    case "nigiri-squid":
    case "nigiri-salmon":
    case "nigiri-egg": {
      const top = { "nigiri-squid": "#eef1f2", "nigiri-salmon": "#f6a9b3", "nigiri-egg": "#f6cf5e" }[type];
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M9 46c0-7 6-11 23-11s23 4 23 11c0 4-3 6-8 6H17c-5 0-8-2-8-6z" fill="#faf1dd" {...s} />
          <path d="M8 34c0-8 10-14 24-14s24 6 24 14c0 3-3 5-8 5H16c-5 0-8-2-8-5z" fill={top} {...s} />
          {type === "nigiri-salmon" && (
            <path d="M15 27h34M17 33h30" stroke="#fde3e7" strokeWidth={2.4} strokeLinecap="round" fill="none" />
          )}
          {type === "nigiri-egg" && <path d="M26 20v19" stroke="#f0894f" strokeWidth={5} fill="none" />}
          <Face cx={32} cy={46} w={8} />
        </svg>
      );
    }

    case "pudding":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="50" rx="20" ry="4.5" fill="#e8b978" opacity="0.5" stroke="none" />
          <path d="M16 22h32l-4 25c-1 5-5 7-12 7s-11-2-12-7z" fill="#f6d99f" {...s} />
          <path d="M16 22c0-4 7-7 16-7s16 3 16 7-7 7-16 7-16-3-16-7z" fill="#c98a4a" {...s} />
          <path d="M22 45c1 4 4 5 10 5" fill="none" stroke="#fbe6bf" strokeWidth={2.4} strokeLinecap="round" />
          <path d="M27 12c-3 2-3 5 0 7 3-2 3-5 0-7z" fill="#e8657f" {...s} strokeWidth={1.8} />
          <Face cx={32} cy={38} w={7} />
        </svg>
      );

    case "wasabi":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <ellipse cx="32" cy="48" rx="21" ry="5" fill="#f4a9b0" opacity="0.5" stroke="none" />
          <path d="M13 46c0-13 8-25 19-25s19 12 19 25z" fill="#9ecb6b" {...s} />
          <circle cx="24" cy="30" r="2.4" fill="#ffffff" opacity="0.4" stroke="none" />
          <path d="M24 40c1-7 3-11 6-14" fill="none" stroke="#c7e6a0" strokeWidth={2.2} strokeLinecap="round" />
          <Face cx={32} cy={39} w={7} />
        </svg>
      );

    case "chopsticks":
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <path d="M14 58c0-9 6-13 18-13s18 4 18 13z" fill="#e8b978" {...s} />
          <path d="M22 47L30 12" stroke="#c99a5f" strokeWidth={6} strokeLinecap="round" fill="none" />
          <path d="M22 47L30 12" {...s} fill="none" strokeWidth={1.8} />
          <path d="M34 47L40 12" stroke="#c99a5f" strokeWidth={6} strokeLinecap="round" fill="none" />
          <path d="M34 47L40 12" {...s} fill="none" strokeWidth={1.8} />
          <path d="M27 17h9" stroke="#f0894f" strokeWidth={4} strokeLinecap="round" fill="none" />
          <Face cx={32} cy={53} w={7} />
        </svg>
      );

    default:
      return null;
  }
}
