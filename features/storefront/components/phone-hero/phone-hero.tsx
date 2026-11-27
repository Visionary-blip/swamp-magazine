"use client";

import Image from "next/image";

import { FEED_STEP_EVENT } from "@/features/transition";
import { cn } from "@/lib/utils";

import { storefrontCopy } from "../../lib/storefront-copy";

// The middle "A" of MAG falls on the woman's face in its column, so it sits a
// little right of it, between the two.
const NUDGED_CELL = 7;

// The founder's shield drawing, the same file the National mascot uses.
const SHIELD_URL = "/world/shield.webp";

// One of the founder's drawings as a mask over a red box, so it takes the brand
// red whatever colour the file is.
function RedMark({ url }: { url: string }) {
  return (
    <span
      className="block size-full bg-brand-red"
      style={{
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

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
// bus-shelter photograph cut close on the two figures, the masthead spread over
// it a letter at a time with the mascot and shield among them.
// Everything laid on the photograph leads down.
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
      {/* One button for the whole grid; only the letters and drawings take
          the tap, not the photograph between them. */}
      <h1 className="pointer-events-none absolute inset-x-0 top-1 bottom-1">
        <button
          type="button"
          onClick={scrollToProducts}
          aria-label={storefrontCopy.phoneMastheadLabel}
          className="grid size-full grid-cols-3 grid-rows-5 place-items-center px-2 font-display text-[27px] leading-none text-brand-red [text-shadow:0_0_6px_var(--ink)]"
        >
          {storefrontCopy.phoneMasthead.map((mark, cell) => {
            // The grid is a fixed list with repeated letters: the cell is each
            // one's identity.
            if (mark === "mascot") {
              return (
                <span
                  key={cell}
                  className="pointer-events-auto block size-[50px] drop-shadow-[0_0_5px_var(--ink)]"
                >
                  {mascot ? <RedMark url={mascot.maskUrl} /> : null}
                </span>
              );
            }
            if (mark === "shield") {
              return (
                <span
                  key={cell}
                  className="pointer-events-auto block h-10 w-7 drop-shadow-[0_0_5px_var(--ink)]"
                >
                  <RedMark url={SHIELD_URL} />
                </span>
              );
            }
            return (
              <span
                key={cell}
                className={cn(
                  "pointer-events-auto p-2",
                  cell === NUDGED_CELL && "translate-x-[4vw]",
                )}
              >
                {mark}
              </span>
            );
          })}
        </button>
      </h1>
    </section>
  );
}
