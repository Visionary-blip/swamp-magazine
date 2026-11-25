"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { setNationalTheme, useNationalTheme } from "../../lib/national-theme";
import { storefrontCopy } from "../../lib/storefront-copy";

// A light/dark-style switch in the bottom-right corner of every page: off is the
// standard look, on is the National Issue's (a navy ground, and on the landing
// the NATIONAL ISSUE masthead and flag bearer). Desktop only, and never in the
// admin. The name sits to its left while it is off and a small V once it is on; the
// switch itself is anchored to the corner, so it does not move when that happens.
export function ThemeSwitch() {
  const national = useNationalTheme();
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  if (pathname === "/stork") return null;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={national}
      aria-label={`${storefrontCopy.nationalWordmark} theme`}
      onClick={() => setNationalTheme(!national)}
      className="group fixed right-8 bottom-6 z-30 hidden cursor-pointer items-center gap-3 focus-visible:outline-none md:flex"
    >
      <span
        aria-hidden={national}
        className="font-display text-sm leading-none tracking-[0.1em] text-brand-red transition-colors duration-200 group-hover:text-brand-yellow group-focus-visible:text-brand-yellow"
      >
        {national
          ? storefrontCopy.nationalSwitchMark
          : storefrontCopy.nationalWordmark}
      </span>
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
    </button>
  );
}
