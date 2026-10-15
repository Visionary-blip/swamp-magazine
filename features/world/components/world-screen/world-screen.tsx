import Link from "next/link";

import { SiteFooter, storefrontCopy } from "@/features/storefront";

const halfClasses =
  "flex min-h-[50dvh] items-center justify-center font-display text-[18vw] leading-none tracking-[0.03em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:min-h-0 md:text-[9vw]";

// WORLD is split down the middle, each half a single button: GALLERY on the
// left, RADIO on the right (the founder's layout). Both are links to their own
// pages rather than inline content.
export function WorldScreen() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex h-16 shrink-0 items-center px-5 md:px-10">
        <Link
          href="/"
          className="font-display text-[15px] tracking-[0.05em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:text-[17px]"
        >
          {storefrontCopy.wordmark}
        </Link>
      </header>

      <div className="grid grow grid-cols-1 md:grid-cols-2">
        <Link
          href="/world/gallery"
          className={`${halfClasses} border-b border-brand-red/40 md:border-r md:border-b-0`}
        >
          GALLERY
        </Link>
        <Link href="/world/radio" className={halfClasses}>
          RADIO
        </Link>
      </div>

      <SiteFooter />
    </main>
  );
}
