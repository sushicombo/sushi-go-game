"use client";

import { useRef } from "react";

/** Ending a game is confirmed in the game's own world, not in the browser's chrome. */
export function StartOver({ onRestart, className = "" }: { onRestart: () => void; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={`shrink-0 rounded-full px-2.5 py-1.5 text-[0.62rem] font-bold tracking-wide whitespace-nowrap uppercase sm:px-3.5 sm:py-2 sm:text-[0.7rem] ${className}`}
        style={{ color: "var(--ink-soft)", boxShadow: "inset 0 0 0 2.5px var(--ink-faint)" }}
      >
        Start over
      </button>

      {/* Native <dialog>: modal focus trap and Esc come free, the skin is ours. */}
      <dialog
        ref={dialog}
        className="confirm plush"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <h2 className="display text-2xl leading-none font-black" style={{ color: "var(--ink)" }}>
          Start over?
        </h2>
        <p className="mt-3 text-sm leading-snug" style={{ color: "var(--ink-soft)" }}>
          This ends the game in front of you. Nothing is kept.
        </p>
        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="btn btn-quiet display flex-1 py-3 text-sm font-bold"
          >
            Keep playing
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.current?.close();
              onRestart();
            }}
            className="btn display flex-1 py-3 text-sm font-bold"
          >
            Start over
          </button>
        </div>
      </dialog>
    </>
  );
}
