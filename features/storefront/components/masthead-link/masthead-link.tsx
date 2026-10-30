import Link from "next/link";

import { storefrontCopy } from "../../lib/storefront-copy";

// The wordmark in the top-left of every inner page, with a small arrow ahead of
// it: the way back to the storefront. Pages inside WORLD add a second, smaller
// link under it that goes back up to WORLD.
export function MastheadLink({
  backToWorld = false,
}: {
  backToWorld?: boolean;
}) {
  const wordmark = (
    <Link
      href="/"
      className="flex items-center gap-2 font-display text-[22px] tracking-[0.05em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:text-[26px]"
    >
      {/* The landing's scroll cue turned to point left: the same chevron, stroke
          and gentle bob. */}
      <svg
        aria-hidden
        viewBox="0 0 10 16"
        className="animate-cue-bob-left h-2.5 w-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.5 1.5L2 8l6.5 6.5" />
      </svg>
      {storefrontCopy.wordmark}
    </Link>
  );
  if (!backToWorld) return wordmark;
  return (
    <div className="flex flex-col items-start gap-1">
      {wordmark}
      <Link
        href="/world"
        // Indented by the arrow (w-1.5) and its gap (gap-2), so it starts under the S.
        className="pl-3.5 font-display text-[16.5px] tracking-[0.05em] md:text-[19.5px] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
      >
        {storefrontCopy.backToWorld}
      </Link>
    </div>
  );
}
