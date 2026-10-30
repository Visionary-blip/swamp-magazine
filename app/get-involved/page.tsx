import type { Metadata } from "next";
import Link from "next/link";

import { PlaceholderScreen } from "@/features/storefront";

export const metadata: Metadata = {
  title: "GET ME INVOLVED — SWAMP MAGAZINE",
};

// The three ways in, stacked in the founder's order; each opens its own form.
const paths = [
  { label: "MODEL", href: "/get-involved/model" },
  { label: "CREATIVE", href: "/get-involved/creative" },
  { label: "GENERAL IDEA", href: "/get-involved/idea" },
] as const;

// No site-mode gate, same as the other footer pages: it leaks nothing about an
// unreleased drop.
export default function GetInvolvedPage() {
  return (
    <PlaceholderScreen title="GET ME INVOLVED" pending={false} hideTitle backToWorld>
      {/* The founder's line, attributed to Virgil Abloh as he asked. */}
      <figure className="flex flex-col gap-1">
        <blockquote className="font-display text-3xl tracking-[0.03em] text-brand-red uppercase sm:text-4xl">
          “You can do it too”
        </blockquote>
        <figcaption className="font-body text-[11px] tracking-[0.3em] text-cream/60">
          — VIRGIL ABLOH
        </figcaption>
      </figure>

      {/* Equal rectangles, as wide as the form column they open onto. */}
      <nav aria-label="Ways to get involved" className="w-full max-w-md">
        <ul className="flex flex-col gap-4">
          {paths.map((path) => (
            <li key={path.href}>
              <Link
                href={path.href}
                className="flex h-24 w-full items-center justify-center border-2 border-brand-red font-display text-4xl tracking-[0.05em] text-brand-red transition-colors duration-200 hover:border-brand-yellow hover:text-brand-yellow focus-visible:border-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
              >
                {path.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* INVENTED -- the founder's wording; the way out for a shopper who
          wandered in. The grid is the product page's home. */}
      <Link
        href="/#products"
        className="font-body text-xs tracking-widest text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
      >
        I&apos;M HAPPY AS A CUSTOMER
      </Link>

      {/* The founder's wording -- for his review. */}
      <p className="max-w-md font-body text-[11px] leading-relaxed tracking-[0.15em] text-cream/60">
        WE ARE CURRENTLY LOOKING FOR STUDENTS AT WILLIAM &amp; MARY, BUT ARE
        OPEN TO TALK TO ANYONE ABOUT POTENTIAL PARTNERSHIPS.
      </p>
    </PlaceholderScreen>
  );
}
