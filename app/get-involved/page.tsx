import type { Metadata } from "next";
import Link from "next/link";

import {
  CreativeForm,
  IdeaForm,
  ModelApplicationForm,
} from "@/features/model-application";
import { PlaceholderScreen } from "@/features/storefront";

export const metadata: Metadata = {
  title: "GET ME INVOLVED — SWAMP MAGAZINE",
};

// No site-mode gate, same as the other footer pages: it leaks nothing about an
// unreleased drop.
export default function GetInvolvedPage() {
  return (
    <PlaceholderScreen title="GET ME INVOLVED" pending={false} hideTitle>
      {/* The founder's line, attributed to Virgil Abloh as he asked. */}
      <figure className="flex flex-col gap-1">
        <blockquote className="font-display text-3xl tracking-[0.03em] text-brand-red uppercase sm:text-4xl">
          “You can do it too”
        </blockquote>
        <figcaption className="font-body text-[11px] tracking-[0.3em] text-cream/60">
          — VIRGIL ABLOH
        </figcaption>
      </figure>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl tracking-[0.05em] text-cream">
            MODEL
          </h2>
          <ModelApplicationForm />
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl tracking-[0.05em] text-cream">
            CREATIVE
          </h2>
          <CreativeForm />
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl tracking-[0.05em] text-cream">
            GENERAL IDEA
          </h2>
          <IdeaForm />
        </section>
      </div>

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
