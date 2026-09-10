const KEY = "sushi-combo:volume";

/** Master volume, 0–1. 0 is muted. Read at play time, so nothing needs wiring through React. */
export function getVolume(): number {
  if (typeof window === "undefined") return 1;
  // Number(null) is 0, so an unset key would read as muted. Check for it first.
  const stored = window.localStorage.getItem(KEY);
  if (stored === null) return 1;
  const raw = Number(stored);
  return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 1;
}

export function setVolume(v: number) {
  window.localStorage.setItem(KEY, String(v));
}

/** `gain` is the sound's own level in the mix; master volume scales it. */
export function play(src: string, gain: number) {
  const volume = getVolume() * gain;
  if (volume <= 0) return;
  const el = new Audio(src);
  el.volume = volume;
  void el.play().catch(() => {});
}
