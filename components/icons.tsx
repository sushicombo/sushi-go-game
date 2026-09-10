import { CardType } from "@/lib/types";

/**
 * The plush set. Every shape is drawn to the same rules as the app icon:
 * one cold charcoal outline at a uniform weight, flat fills with no gradient,
 * pillowy silhouettes, and no face — the shape alone has to carry recognition.
 */
const INK = "#2F3E44";

/** Outline spec shared by every filled shape. Thicker at chip sizes so 24px art doesn't clog. */
function ink(small: boolean) {
  return {
    stroke: INK,
    strokeWidth: small ? 4.4 : 3.4,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
}

/** The rice pillow every nigiri sits on: scalloped along the bottom, dashed with grains. */
function Rice({ small }: { small: boolean }) {
  return (
    <>
      <path
        d="M6 38c0-12 11-20 26-20s26 8 26 20c0 4-3 6-6 5-1 4-5 6-9 4-2 3-6 4-9 2-3 3-7 3-10 0-3 2-7 1-9-2-4 2-8 0-9-4-3 1-6-1-6-5z"
        fill="#FBF0DE"
        {...ink(small)}
      />
      {/* Grains are detail, not structure — they drop out at chip size. */}
      {!small && (
        <path
          d="M16 42h5M27 47h5M39 43h5M47 45h4"
          fill="none"
          stroke="#E7D2A2"
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
    </>
  );
}

/** The topping slab draped over the rice, shared by salmon and squid. */
const DRAPE =
  "M7 33c1-11 12-19 25-19s24 8 25 19c1 4-3 5-8 3-6-2-11-4-17-4s-11 2-17 4c-5 2-9 1-8-3z";

export function CardIcon({ type, className = "w-10 h-10" }: { type: CardType; className?: string }) {
  // Below ~32px the interior detail turns to soot, so the art simplifies rather than shrinks.
  const small = /(^|\s)(h-4|h-5|h-6|h-7)(\s|$)/.test(className);
  const s = ink(small);
  const svg = (children: React.ReactNode) => (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      {children}
    </svg>
  );

  switch (type) {
    case "tempura":
      return svg(
        <>
          <path d="M18 48L3 55l3-10-4-9 13 3z" fill="#EE5A47" {...s} />
          <path
            d="M14 51c-6-5-6-13-1-19L34 12c5-5 13-5 18 0s5 13 0 18L31 51c-5 5-11 5-17 0z"
            fill="#F0B963"
            {...s}
          />
          {!small && (
            <g fill="#F8D79A" stroke="none">
              <circle cx="22" cy="40" r="3" />
              <circle cx="31" cy="30" r="2.6" />
              <circle cx="41" cy="21" r="2.6" />
              <circle cx="30" cy="45" r="2.4" />
              <circle cx="42" cy="34" r="2.4" />
            </g>
          )}
        </>
      );

    case "sashimi":
      // Three cut slices fanned down the plate, leaning on the knife angle, marbled with fat lines.
      return svg(
        <>
          {[
            [18, 6],
            [12, 23],
            [6, 40],
          ].map(([x, y]) => (
            <g key={y} transform={`translate(${x} ${y}) skewX(-20)`}>
              <path d="M7 0h26c4 0 7 3 7 8s-3 8-7 8H7c-4 0-7-3-7-8s3-8 7-8z" fill="#EE5A47" {...s} />
              {!small && (
                <path
                  d="M13 4v8M22 4v8M31 4v8"
                  fill="none"
                  stroke="#F9C4B6"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
        </>
      );

    case "dumpling":
      return svg(
        <>
          <path d="M8 40c0-15 10-25 24-25s24 10 24 25c0 6-4 9-10 9H18c-6 0-10-3-10-9z" fill="#F6E4BC" {...s} />
          <path d="M8 40h48" fill="none" {...s} />
          <path
            d="M19 46c1-9 3-14 5-17M32 46c0-10 1-15 2-19M45 46c-1-9-3-14-5-17"
            fill="none"
            stroke={INK}
            strokeWidth={small ? 3.4 : 2.6}
            strokeLinecap="round"
            opacity={small ? 0.7 : 0.45}
          />
        </>
      );

    case "maki1":
    case "maki2":
    case "maki3": {
      const pips = { maki1: 1, maki2: 2, maki3: 3 }[type];
      return svg(
        <>
          <circle cx="32" cy="26" r="23" fill="#3C5A52" {...s} />
          <circle cx="32" cy="26" r="15.5" fill="#FBF0DE" {...s} />
          <circle cx="32" cy="26" r="7" fill="#EE5A47" {...s} />
          {!small && (
            <path
              d="M22 18c2-3 4-4 6-5"
              fill="none"
              stroke="#557C71"
              strokeWidth={3.4}
              strokeLinecap="round"
            />
          )}
          {/* The roll count is the card's whole identity — it survives at every size. */}
          {Array.from({ length: pips }).map((_, i) => (
            <circle key={i} cx={32 + (i - (pips - 1) / 2) * 11} cy="56" r="4.4" fill="#3C5A52" stroke="none" />
          ))}
        </>
      );
    }

    case "nigiri-squid":
      return svg(
        <>
          <Rice small={small} />
          <path d={DRAPE} fill="#EEF1F0" {...s} />
          {/* Squid is the palest topping; without a drawn edge it reads as bare rice at chip size. */}
          <path
            d="M13 28c5-4 12-6 19-6s14 2 19 6"
            fill="none"
            stroke={INK}
            strokeWidth={small ? 3 : 2.4}
            strokeLinecap="round"
            opacity={0.5}
          />
        </>
      );

    case "nigiri-salmon":
      return svg(
        <>
          <Rice small={small} />
          <path d={DRAPE} fill="#EE5A47" {...s} />
          {!small && (
            <path
              d="M16 30c2-5 6-9 11-11M28 30c2-5 5-8 9-10M40 31c3-3 5-5 8-6"
              fill="none"
              stroke="#F58A78"
              strokeWidth={3.2}
              strokeLinecap="round"
            />
          )}
        </>
      );

    case "nigiri-egg":
      return svg(
        <>
          <Rice small={small} />
          <path
            d="M8 32c0-10 11-17 24-17s24 7 24 17c0 4-3 5-8 4-5-1-10-2-16-2s-11 1-16 2c-5 1-8 0-8-4z"
            fill="#F7C64B"
            {...s}
          />
          {/* The nori band is what separates egg from squid at a glance. */}
          <path d="M24 16v18" stroke="#3C5A52" strokeWidth={6} fill="none" />
          <path d="M24 16v18" fill="none" {...s} strokeWidth={2.4} />
        </>
      );

    case "pudding":
      return svg(
        <>
          <path d="M13 24h38l-5 24c-1 5-6 8-14 8s-13-3-14-8z" fill="#F5CE74" {...s} />
          <path d="M13 24c0-5 8-9 19-9s19 4 19 9-8 9-19 9-19-4-19-9z" fill="#C97F3E" {...s} />
          {!small && (
            <path d="M20 45c1 5 5 7 11 7" fill="none" stroke="#FBDC8E" strokeWidth={3.4} strokeLinecap="round" />
          )}
        </>
      );

    case "wasabi":
      return svg(
        <>
          <path d="M11 47c0-14 9-27 21-27s21 13 21 27z" fill="#8FC05C" {...s} />
          <path d="M11 47c0-3 9-5 21-5s21 2 21 5" fill="none" {...s} />
          {!small && (
            <path d="M24 40c1-8 4-13 7-16" fill="none" stroke="#B4D98E" strokeWidth={3.4} strokeLinecap="round" />
          )}
        </>
      );

    case "chopsticks":
      // Two sticks under one coral sleeve. Filled shapes, so the outline weight matches every other icon.
      return svg(
        <>
          <rect x="19" y="14" width="9" height="45" rx="4.5" fill="#D9A05B" transform="rotate(-9 32 32)" {...s} />
          <rect x="36" y="14" width="9" height="45" rx="4.5" fill="#D9A05B" transform="rotate(9 32 32)" {...s} />
          {/* The sleeve is drawn last so it hides the stick caps — otherwise they read as antennae. */}
          <rect x="11" y="9" width="42" height="15" rx="7.5" fill="#EE5A47" {...s} />
        </>
      );

    default:
      return null;
  }
}
