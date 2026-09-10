"use client";

import { useEffect } from "react";

/** Delegated so every button (buttons, cards) gets a click sound without wiring each one. */
export function ClickSound() {
  useEffect(() => {
    const audio = new Audio("/click.mp3");
    audio.volume = 0.4;

    function onClick(e: MouseEvent) {
      const button = (e.target as HTMLElement).closest("button:not(:disabled)");
      if (!button) return;
      const el = audio.cloneNode(true) as HTMLAudioElement;
      el.volume = 0.4;
      void el.play().catch(() => {});
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
