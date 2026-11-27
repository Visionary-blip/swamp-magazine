"use client";

import Image from "next/image";

import { FEED_STEP_EVENT } from "@/features/transition";

import { storefrontCopy } from "../../lib/storefront-copy";

// Four across by as many as twelve down; the rows that do not fit the screen
// collapse to nothing (see the grid below).
const MASCOT_CELLS = Array.from({ length: 48 }, (_, cell) => cell);

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
// bus-shelter photograph cut close on the two figures, with a grid of the
// mascot over it. A tap on any of them leads down.
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
      {/* The fisher, four across. The screen's shape picks the number of rows:
          as many cells about a quarter-width tall as fit, stretched to share
          the height, and the rest of the cells in rows of no height. One button
          for the lot; only the drawings take the tap. */}
      {mascot ? (
        <button
          type="button"
          onClick={scrollToProducts}
          aria-label="Scroll to the products"
          className="pointer-events-none absolute inset-0 grid auto-rows-[0px] grid-cols-4 grid-rows-[repeat(auto-fill,minmax(25vw,1fr))] overflow-hidden"
        >
          {MASCOT_CELLS.map((cell) => (
            <span
              key={cell}
              className="flex min-h-0 items-center justify-center overflow-hidden"
            >
              <span className="pointer-events-auto block size-[66px] drop-shadow-[0_0_5px_var(--ink)]">
                {/* The drawing as a mask over a red box: the brand red. */}
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
              </span>
            </span>
          ))}
        </button>
      ) : null}
    </section>
  );
}
