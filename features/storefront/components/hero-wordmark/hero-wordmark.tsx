"use client";

import { useNationalTheme } from "../../lib/national-theme";
import { storefrontCopy } from "../../lib/storefront-copy";
import { GlideLink } from "../glide-link/glide-link";

// NATIONAL ISSUE is a little narrower than SWAMP MAGAZINE at the same type size,
// so it is stretched sideways by the ratio of the two widths (measured in Anton
// at one size: 791 / 662) to run edge to edge like the wordmark does; the type
// size, and so the height, is unchanged.
const NATIONAL_STRETCH = 1.195;

// The landing's big red masthead word: SWAMP MAGAZINE, or NATIONAL under the
// National Issue theme. Same size, same link to the grid, same hover.
export function HeroWordmark({ className }: { className: string }) {
  const national = useNationalTheme();
  return (
    <h1 className="w-full text-center font-display text-[14vw] leading-none whitespace-nowrap">
      <GlideLink
        href="#products"
        className={national ? `inline-block ${className}` : className}
        style={
          national ? { transform: `scaleX(${NATIONAL_STRETCH})` } : undefined
        }
      >
        {national ? storefrontCopy.nationalWordmark : storefrontCopy.wordmark}
      </GlideLink>
    </h1>
  );
}
