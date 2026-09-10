"use client";

import { useEffect } from "react";
import { play } from "@/lib/sound";

/** Delegated so every button (buttons, cards) gets a click sound without wiring each one. */
export function ClickSound() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("button:not(:disabled)")) return;
      play("/click.mp3", 0.4);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
