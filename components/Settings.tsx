"use client";

import { useEffect, useRef, useState } from "react";
import { getVolume, setVolume } from "@/lib/sound";

/** A plush gear, drawn to the same rules as the card set: one cold charcoal
 * outline, flat fill, no gradient. The body and teeth are stroked as one silhouette
 * (ink pass, then fill pass) so no seams show where the teeth meet the hub. */
function GearIcon({ className = "h-4 w-4" }: { className?: string }) {
  const shapes = (
    <>
      <circle cx="32" cy="30" r="19" />
      {[0, 60, 120].map((a) => (
        <rect key={a} x="24.5" y="4" width="15" height="52" rx="5.5" transform={`rotate(${a} 32 30)`} />
      ))}
    </>
  );

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      {/* Depth is a solid block of ink underneath, never a blur. */}
      <g fill="#2F3E44" stroke="#2F3E44" strokeWidth="6.8" strokeLinejoin="round" transform="translate(0 5)">
        {shapes}
      </g>
      <g fill="#2F3E44" stroke="#2F3E44" strokeWidth="6.8" strokeLinejoin="round">
        {shapes}
      </g>
      <g fill="#EE5A47">{shapes}</g>
      <circle cx="32" cy="30" r="7.5" fill="#EDE2CC" stroke="#2F3E44" strokeWidth="3.4" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {muted ? (
        <path d="M16 9.5l4.5 5m0-5l-4.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path
          d="M15.5 9c1.2 1.6 1.2 4.4 0 6M18.5 6.5c2.3 3 2.3 8 0 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/** Sound settings, in the game's own world. Volume lives in localStorage; 0 is mute. */
export function Settings({ className = "" }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [volume, setVol] = useState(1);
  // The level to come back to when unmuting.
  const [last, setLast] = useState(0.7);

  useEffect(() => {
    const v = getVolume();
    setVol(v);
    if (v > 0) setLast(v);
  }, []);

  function change(v: number) {
    setVol(v);
    setVolume(v);
    if (v > 0) setLast(v);
  }

  const muted = volume === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label="Settings"
        className={`shrink-0 transition-transform duration-300 ease-out hover:rotate-30 ${className}`}
      >
        <GearIcon className="h-8 w-8 sm:h-9 sm:w-9" />
      </button>

      <dialog
        ref={dialog}
        className="confirm plush"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <h2 className="display text-2xl leading-none font-black" style={{ color: "var(--ink)" }}>
          Settings
        </h2>
        <p className="mt-3 text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>
          Sound: card clicks and the round bell. Slide to nothing to mute.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => change(muted ? last : 0)}
            aria-pressed={muted}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            style={{
              background: muted ? "var(--coral)" : "var(--card)",
              color: muted ? "var(--on-coral)" : "var(--ink)",
              boxShadow: "inset 0 0 0 3px var(--ink)",
            }}
          >
            <SpeakerIcon muted={muted} />
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => change(Number(e.target.value))}
            aria-label="Volume"
            className="h-2 flex-1 cursor-pointer"
          />

          <span className="display w-10 shrink-0 text-right text-sm font-bold" style={{ color: "var(--ink)" }}>
            {Math.round(volume * 100)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="btn display mt-7 w-full py-3 text-sm font-bold"
        >
          Done
        </button>
      </dialog>
    </>
  );
}
