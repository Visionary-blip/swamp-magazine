import Link from "next/link";

import {
  footerColumns,
  footerLegalLinks,
  type FooterColumn,
  type FooterLink,
} from "../../lib/footer-links";
import { storefrontCopy } from "../../lib/storefront-copy";
import { MarqueeTicker } from "../marquee-ticker/marquee-ticker";
import { StarMark } from "../star-mark/star-mark";

export type SiteFooterProps = {
  /**
   * Overrides the storefront's ticker line. Coming-soon passes its own, which
   * carries COMING SOON -- the one thing that page exists to say -- so the two
   * pages share one marquee implementation without sharing their words.
   */
  tickerLine?: string;
};

// The storefront's one footer, shared by the landing, the product pages and the
// stub pages the footer itself links to -- so the navigation is the same
// wherever a reader lands.
//
// It keeps Direction A's spine exactly as the brief specified it (1px red-35%
// top rule, the marquee ticker, the byline) and hangs the link columns off the
// middle. Nothing here animates: the ticker's CSS marquee is the only motion in
// the footer, and an entrance animation on navigation would be noise, not
// language. The columns are laid out on the same hairline-and-tracking grammar
// as the catalog index above them.
export function SiteFooter({
  tickerLine = storefrontCopy.ticker,
}: SiteFooterProps = {}) {
  return (
    <footer className="border-t border-brand-red/35 bg-ink pt-4">
      <MarqueeTicker line={tickerLine} />

      <div className="px-5 pt-7 pb-5 md:px-[120px] md:pt-8 md:pb-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:gap-x-10">
          <BrandBlock />
          {footerColumns.map((column) => (
            <FooterNavColumn key={column.heading} column={column} />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 border-t border-brand-red/35 pt-4 md:mt-6 md:flex-row md:justify-between md:gap-0">
          <p className="font-body text-[10px] font-medium tracking-[0.3em] text-cream/45">
            {/* Statically rendered stub pages freeze this at their build year.
                Accepted: forcing every page dynamic for a copyright line costs
                a request-time render everywhere to fix a number nobody reads. */}
            © {new Date().getFullYear()} {storefrontCopy.wordmark}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLegalLinks.map((link) => (
              <li key={link.href}>
                <FooterNavLink
                  link={link}
                  className="text-cream/35 hover:text-brand-red focus-visible:text-brand-red"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

// The masthead lockup, quieter than the hero's: the mark and the wordmark at
// footer scale, so the page closes on the same two words it opened with.
function BrandBlock() {
  return (
    <div className="col-span-2 flex flex-col gap-2 md:col-span-1">
      <StarMark className="w-[26px] text-brand-red" />
      <p className="font-display text-[20px] leading-none tracking-[0.04em] text-cream">
        {storefrontCopy.wordmark}
      </p>
      <p className="font-body text-[10px] font-medium tracking-[0.35em] text-cream/45">
        {storefrontCopy.byline}
      </p>
    </div>
  );
}

function FooterNavColumn({ column }: { column: FooterColumn }) {
  return (
    <nav aria-label={column.heading} className="flex flex-col gap-2">
      <p className="font-body text-[10px] font-semibold tracking-[0.35em] text-brand-red">
        {column.heading}
      </p>
      <ul className="flex flex-col gap-0.5">
        {column.links.map((link) => (
          <li key={link.href}>
            <FooterNavLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

// One link renderer for both kinds, so an external destination can never ship
// without its rel -- next/link for internal routes (prefetch, client nav), a
// plain anchor for anything that leaves the site.
function FooterNavLink({
  link,
  className = "text-cream/70 hover:text-brand-yellow focus-visible:text-brand-yellow",
}: {
  link: FooterLink;
  className?: string;
}) {
  const classes = `inline-flex items-center py-1 pointer-coarse:min-h-11 font-body text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red ${className}`;

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={classes}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={classes}>
      {link.label}
    </Link>
  );
}
