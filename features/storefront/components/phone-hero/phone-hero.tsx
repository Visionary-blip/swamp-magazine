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
// bus-shelter photograph cut close on the two figures, with the mascot alone
// over it. A tap on the mascot leads down.
export function PhoneHero({
  mascot,
}: {
  /** The fisher, as on the wide hero; null until it is uploaded. */
  mascot: { maskUrl: string } | null;
}) {
  return (
    <section
      data-feed-stop
      className="relative h-dvh overflow-hidden bg-ink md:hidden"
    >
      {/* A close cut, centred on the two. The screen's width, standing on the
          foot of the screen; on a short screen it stops rising and runs off the
          bottom instead, so their heads stay well down from the top. */}
      <div className="absolute inset-x-0 top-[max(calc(100%_-_216.7vw),calc(4rem_-_28vw))] aspect-[600/1300]">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_14%)]">
          <Image
            src="/hero/landing-hero-phone-grid.webp"
            alt="Two people in SWAMP MAGAZINE sweatshirts on a bus-shelter bench beside windows covered in drawings"
            fill
            sizes="100vw"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
      </div>
      {/* No visible words here; the name is still the screen's heading. */}
      <h1 className="sr-only">{storefrontCopy.wordmark}</h1>
      {/* The fisher as a mask over a red box, so it takes the brand red. */}
      {mascot ? (
        <button
          type="button"
          onClick={scrollToProducts}
          aria-label="Scroll to the products"
          className="absolute top-12 left-1/2 block size-[108px] -translate-x-1/2 drop-shadow-[0_0_5px_var(--ink)]"
        >
          <span
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
    </section>
  );
}
