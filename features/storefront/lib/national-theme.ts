import { useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY } from "./theme-boot";

// The storefront's two looks: the standard one and the National Issue's. It is
// the visitor's own choice, kept in their browser, so there is no server state
// and nothing a crawler or another visitor can see change.

function applyTheme(national: boolean) {
  if (national) document.documentElement.dataset.theme = "national";
  else delete document.documentElement.dataset.theme;
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readNational(): boolean {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "national";
  } catch {
    return false;
  }
}

/** The server and the first paint are always the standard look; a visitor who
 * chose the National one gets it as soon as the page is live. */
export function useNationalTheme(): boolean {
  return useSyncExternalStore(subscribe, readNational, () => false);
}

export function setNationalTheme(national: boolean) {
  try {
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      national ? "national" : "standard",
    );
  } catch {
    // Private mode and the like: the switch still works until the page reloads.
  }
  applyTheme(national);
  for (const listener of listeners) listener();
}
