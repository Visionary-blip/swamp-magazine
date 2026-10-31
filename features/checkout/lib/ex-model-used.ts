import { useSyncExternalStore } from "react";

// The EX-MODEL button is a one-time thing: once an order has gone through, this
// browser never shows it again. There is no password behind it, so the record
// lives in the browser alone -- it keeps the button from being offered twice, not
// from a determined visitor.
const STORAGE_KEY = "swamp-ex-model-used";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readUsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Reads true on the server, so the button is never drawn for someone who has
 * already used it and then pulled back. */
export function useExModelUsed(): boolean {
  return useSyncExternalStore(subscribe, readUsed, () => true);
}

export function markExModelUsed() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private mode and the like: the button simply stays until the page reloads.
  }
  for (const listener of listeners) listener();
}
