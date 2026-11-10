// The theme's storage key and the script that applies it before first paint. A
// file of its own, with nothing from React in it, because the root layout (a
// server component) imports it while the theme hook (a client one) shares the key.
export const THEME_STORAGE_KEY = "swamp-theme-v1";

/** Runs in <head> before the first paint, so a visitor who chose the National
 * Issue never sees the brown ground flash before the navy. */
export const themeBootScript = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="national")document.documentElement.dataset.theme="national"}catch(e){}`;
