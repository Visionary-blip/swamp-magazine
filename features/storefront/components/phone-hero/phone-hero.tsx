"use client";

import Image from "next/image";

import { FEED_STEP_EVENT } from "@/features/transition";

import { storefrontCopy } from "../../lib/storefront-copy";

// On to the products. In the one-at-a-time feed the pager takes the step (and
// cancels the event to say so); the grid is an ordinary scrolling <main>.
function scrollToProducts() {
  const step = new CustomEvent(FEED_STEP_EVENT, {
    detail: 1,
    cancelable: true,
  });
  if (!window.dispatchEvent(step)) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document
    .querySelector("#products")
    ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
}

// The phone's opening screen, ahead of the products in both views: the
// kerbside photograph cut down to the two figures, "SWAMP" over it, the
// arrow and byline at the foot. Everything laid on the photograph leads down.
export function PhoneHero({
  mascot,
}: {
  /** The fisher, as on the wide hero; null until it is uploaded. */
  mascot: { maskUrl: string; alt: string } | null;
}) {
  return (
    <section
      data-feed-stop
      className="relative flex h-dvh flex-col items-center justify-between overflow-hidden bg-ink pt-16 pb-3 md:hidden"
    >
      {/* Hung from the top at the screen's width, so the figures are never
          sliced at the sides and the man's face (40% down the cut, 83vw) stays
          below "SWAMP" (which ends at 4rem + 34vw) on any screen. A short
          screen only loses road off the bottom; a very tall one sees the road
          fade into the ink. */}
      <div className="absolute inset-x-0 top-0 aspect-[959/2000]">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_92%,transparent)]">
          <Image
            src="/hero/landing-hero-phone-curb.webp"
            alt="Two people in SWAMP MAGAZINE sweatshirts sitting on a kerb under street lamps at night"
            fill
            sizes="100vw"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
        {/* Centred, above the two heads, so it covers neither; three quarters
            of the wide hero's 34vw. Part of the photo's box, to stay there on
            any screen. */}
        {mascot ? (
          // The shadow lifts the line art off the lit pole. It sits on the button
          // because the drawing's own mask would cut it off.
          <button
            type="button"
            onClick={scrollToProducts}
            aria-label={mascot.alt || "Shop the products"}
            className="absolute top-[26.5%] left-1/2 block aspect-square w-[25.5vw] -translate-x-1/2 drop-shadow-[0_0_5px_var(--ink)]"
          >
            <span
              aria-hidden
              className="block size-full bg-brand-red"
              style={{
                maskImage: `url(${mascot.maskUrl})`,
                WebkitMaskImage: `url(${mascot.maskUrl})`,
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
              }}
            />
          </button>
        ) : null}
      </div>
      {/* The road is lit nearly as brightly as the red type is, so the foot is
          shaded for the arrow and byline. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-ink via-ink/75 to-transparent"
      />
      <h1 className="relative font-display text-[34vw] leading-none text-brand-red">
        <button type="button" onClick={scrollToProducts} className="block">
          {storefrontCopy.phoneWordmark}
        </button>
      </h1>
      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={scrollToProducts}
          aria-label="Scroll to the products"
          className="flex size-10 items-center justify-center text-brand-red"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 10"
            className="animate-cue-bob h-3 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1.5 1.5l6.5 6.5 6.5-6.5" />
          </svg>
        </button>
        <button
          type="button"
          onClick={scrollToProducts}
          className="py-1 font-body text-base font-semibold tracking-[0.4em] text-brand-red"
        >
          {storefrontCopy.phoneByline}
        </button>
      </div>
    </section>
  );
}
