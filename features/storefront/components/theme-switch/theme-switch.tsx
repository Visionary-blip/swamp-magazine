"use client";

import { cn } from "@/lib/utils";

import { setNationalTheme, useNationalTheme } from "../../lib/national-theme";
import { storefrontCopy } from "../../lib/storefront-copy";

// A light/dark-style switch in the bottom-left corner: off is the standard
// look, on is the National Issue's. Desktop only, because the masthead and
// mascot it changes are the desktop hero.
export function ThemeSwitch() {
  const national = useNationalTheme();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={national}
      aria-label={`${storefrontCopy.nationalWordmark} theme`}
      onClick={() => setNationalTheme(!national)}
      className="group fixed bottom-6 left-14 z-30 hidden cursor-pointer items-center gap-3 focus-visible:outline-none md:flex"
    >
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 rounded-full border bg-ink/80 transition-colors duration-200 group-hover:border-brand-yellow group-focus-visible:border-brand-yellow",
          national ? "border-brand-yellow" : "border-brand-red/70",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full transition-all duration-200",
            national ? "translate-x-5 bg-brand-yellow" : "bg-brand-red",
          )}
        />
      </span>
      <span
        className={cn(
          "font-display text-sm leading-none tracking-[0.1em] transition-colors duration-200 group-hover:text-brand-yellow group-focus-visible:text-brand-yellow",
          national ? "text-brand-yellow" : "text-brand-red",
        )}
      >
        {storefrontCopy.nationalWordmark}
      </span>
    </button>
  );
}
