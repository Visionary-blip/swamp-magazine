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
// bus-shelter photograph cut down to the two figures, "SWAMP" over it, the
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
      {/* The cut is taller than it would need to be to fill the screen: filling
          it would slice into the figures at the sides. It spans the width
          instead and fades into the ink above and below. It sits near the foot,
          but on a short screen it stops rising where the man's face (31% down
          the cut, 54.6vw) would go under "SWAMP" (which ends at 4rem + 34vw),
          and runs off the bottom instead. */}
      <div className="absolute inset-x-0 top-[max(calc(100%_-_3.5rem_-_175.4vw),calc(4rem_-_16vw))] aspect-[760/1333]">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_90%,transparent)]">
          <Image
            src="/hero/landing-hero-phone.webp"
            alt="Two people in SWAMP MAGAZINE sweatshirts in a lamplit bus shelter at night"
            fill
            sizes="100vw"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
        {/* Centred, between the two, so it covers neither; three quarters of
            the wide hero's 34vw. Part of the photo's box, to stay in that gap on
            any screen. */}
        {mascot ? (
          <button
            type="button"
            onClick={scrollToProducts}
            aria-label={mascot.alt || "Shop the products"}
            className="absolute top-[42%] left-1/2 block aspect-square w-[25.5vw] -translate-x-1/2 bg-brand-red"
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
        ) : null}
      </div>
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
