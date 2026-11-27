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
// bus-shelter photograph cut down to the two figures, "SWAMP" over it and the
// arrow at the foot. Everything laid on the photograph leads down.
export function PhoneHero({
  mascot,
}: {
  /** The fisher, as on the wide hero; null until it is uploaded. */
  mascot: { maskUrl: string; alt: string } | null;
}) {
  return (
    <section
      data-feed-stop
      className="relative flex h-dvh flex-col items-center justify-between overflow-hidden bg-ink pt-16 pb-4 md:hidden"
    >
      {/* The screen's width, so the figures are never sliced at the sides, and
          standing on the foot of the screen. On a short screen it stops rising
          where the man's head (42% down the cut, 76vw) would go under "SWAMP"
          (which ends at 4rem + 34vw), and runs off the bottom instead. */}
      <div className="absolute inset-x-0 top-[max(calc(100%_-_180.2vw),calc(4rem_-_38vw))] aspect-[1110/2000]">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_14%)]">
          <Image
            src="/hero/landing-hero-phone-shelter.webp"
            alt="Two people in SWAMP MAGAZINE sweatshirts on a bus-shelter bench beside windows covered in drawings"
            fill
            sizes="100vw"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
        {/* Small and low, in the dark under the windows, clear of both. Part of
            the photo's box, to stay there on any screen. */}
        {mascot ? (
          // The shadow lifts the line art off the photograph. It sits on the
          // button because the drawing's own mask would cut it off.
          <button
            type="button"
            onClick={scrollToProducts}
            aria-label={mascot.alt || "Shop the products"}
            className="absolute top-[73%] right-[2%] block aspect-square w-[17vw] drop-shadow-[0_0_5px_var(--ink)]"
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
      {/* Shades the foot so the red arrow reads over the photograph. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink to-transparent"
      />
      <h1 className="relative font-display text-[34vw] leading-none text-brand-red">
        <button type="button" onClick={scrollToProducts} className="block">
          {storefrontCopy.phoneWordmark}
        </button>
      </h1>
      <button
        type="button"
        onClick={scrollToProducts}
        aria-label="Scroll to the products"
        className="relative flex size-10 items-center justify-center text-brand-red"
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
    </section>
  );
}
