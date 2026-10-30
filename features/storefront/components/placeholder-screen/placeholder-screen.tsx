import type { ReactNode } from "react";

import { storefrontCopy } from "../../lib/storefront-copy";
import { MastheadLink } from "../masthead-link/masthead-link";
import { SiteFooter } from "../site-footer/site-footer";
import { StarMark } from "../star-mark/star-mark";

export type PlaceholderScreenProps = {
  /** The page's own name, as the footer link that reached it spells it. */
  title: string;
  /** Anything the page can honestly say already -- /contact's mailto is the
   * only caller using it so far. Everything else stays empty rather than
   * filling the space with copy nobody wrote. */
  children?: ReactNode;
  /** Pages with real copy turn the "still being written" line off. */
  pending?: boolean;
  /** Keeps the heading for screen readers and the tab title but not on the
   * page, for screens whose content speaks for itself. */
  hideTitle?: boolean;
  /** Pages inside WORLD get a BACK TO WORLD link under the masthead. */
  backToWorld?: boolean;
};

// One screen behind every footer destination the founder has not written yet.
// Shared rather than seven near-identical pages, so the holding state is a
// single edit and replacing a page means deleting its route's call here, not
// unpicking a bespoke layout.
//
// It is deliberately a real page in Direction A's language -- ink, the mark,
// the masthead, the same footer -- and not a styled 404: the link that reached
// it is a promise the site intends to keep, and a reader who follows ABOUT
// should land somewhere that says so rather than somewhere that looks broken.
export function PlaceholderScreen({
  title,
  children,
  pending = true,
  hideTitle = false,
  backToWorld = false,
}: PlaceholderScreenProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 px-5 py-2 md:px-10">
        <MastheadLink backToWorld={backToWorld} />
      </header>

      <section className="flex grow flex-col items-center justify-center gap-7 px-5 py-24 text-center md:py-32">
        <StarMark className="w-[32px] text-brand-red" />
        <h1
          className={
            hideTitle
              ? "sr-only"
              : "font-display text-[13vw] leading-none tracking-[0.03em] text-cream uppercase sm:text-[64px]"
          }
        >
          {title}
        </h1>
        {pending ? (
          <p className="font-body text-[11px] font-medium tracking-[0.3em] text-cream/45">
            {storefrontCopy.pagePending}
          </p>
        ) : null}
        {children}
      </section>

      <SiteFooter />
    </main>
  );
}
