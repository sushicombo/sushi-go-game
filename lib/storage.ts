import { GameState } from "./types";

const KEY = "sushi-combo-save";

export function saveGame(state: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ponytail: localStorage can throw in private mode / quota — silently skip persistence
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
