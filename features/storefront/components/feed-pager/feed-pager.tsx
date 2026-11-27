"use client";

import { useEffect, useRef, useState } from "react";

import { dials } from "@/config/dials";
import { createFeedPager, FEED_STEP_EVENT } from "@/features/transition";
import { cn } from "@/lib/utils";

import { StarMark } from "../star-mark/star-mark";

// The phone landing as a Reels-style feed: one product per screen, a swipe lands
// on the next. The paging itself is shared with the product pages (see
// createFeedPager); this adds what is the landing's own: the arriving product
// fades in, and a column of dots shows which of the products is on screen.
// How long the arriving product takes to fade in.
const FADE_MS = 500;

// A product page open over the feed (see ProductOverlay) owns the gestures.
function productOpen() {
  return document.body.hasAttribute("data-product-open");
}

export function FeedPager({ count }: { count: number }) {
  // -1 is the opening photograph, ahead of the first product.
  const [active, setActive] = useState(-1);
  // "grid" (the default): every product, three across, scrolled like a page.
  // "feed": one product per screen, swiped. The landing's <main> carries it as `data-view` so the
  // tiles restyle themselves in CSS (see CatalogIndex).
  const [view, setView] = useState<"feed" | "grid">("grid");
  const switched = useRef(false);

  useEffect(() => {
    const track = document.querySelector<HTMLElement>("[data-feed-track]");
    const main = track?.closest("main");
    if (!track || !main) return;
    main.dataset.view = view;
    main.scrollTop = 0;
    // A visitor who switched views, or came back by a "shop" link, is after the
    // products, not the opening photograph again.
    const toProducts = switched.current || window.location.hash === "#products";
    // The grid is an ordinary scrolling page: the pager is not running at all.
    if (view === "grid") {
      if (toProducts) main.querySelector("#products")?.scrollIntoView();
      return;
    }
    const products = [
      ...track.querySelectorAll<HTMLElement>("[data-feed-product]"),
    ];
    const stopPaging = createFeedPager(track, {
      isActive: () => !productOpen(),
      onStep(stop, animated) {
        // The star after the dots is WORLD, and so is the footer rest point
        // below it (the only point with no stop of its own).
        setActive(
          stop && !stop.hasAttribute("data-feed-world")
            ? products.indexOf(stop)
            : products.length,
        );
        if (
          animated &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          stop?.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: FADE_MS,
            easing: "ease-out",
          });
        }
      },
    });
    if (toProducts) {
      window.dispatchEvent(
        new CustomEvent(FEED_STEP_EVENT, { detail: 1, cancelable: true }),
      );
    }
    return stopPaging;
  }, [view]);

  // With the feed switched off there is nothing to switch to; the effect above
  // still runs, for the grid's "shop" links.
  if (!dials.phoneSingleProductFeed || count < 2) return null;
  // Phone only; the pager's own rest stops are what it tracks, so it sits with
  // the pager rather than in the catalog.
  return (
    <>
      <button
        type="button"
        onClick={() => {
          switched.current = true;
          setView(view === "feed" ? "grid" : "feed");
        }}
        aria-label={
          view === "feed" ? "Show all products" : "Show one at a time"
        }
        // A touch target a little larger than the glyph, top centre.
        className="fixed top-3 left-1/2 z-30 flex size-12 -translate-x-1/2 items-center justify-center text-brand-red transition-colors duration-200 focus-visible:text-brand-yellow focus-visible:outline-none md:hidden"
      >
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          className="size-4"
          fill="currentColor"
        >
          {view === "feed" ? (
            // Two by two: all the products.
            <path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z" />
          ) : (
            // Three rows: back to one at a time.
            <path d="M1 2h12v2H1zM1 6h12v2H1zM1 10h12v2H1z" />
          )}
        </svg>
      </button>
      {view === "feed" && active >= 0 ? (
        <ol
          aria-hidden
          className="pointer-events-none fixed top-1/2 right-3.5 z-30 flex -translate-y-1/2 flex-col items-center gap-2 md:hidden"
        >
          {Array.from({ length: count }, (_, dot) => (
            <li
              key={dot}
              className={cn(
                "size-2 rounded-full bg-brand-red transition-[opacity,transform] duration-300",
                dot === active ? "scale-110 opacity-100" : "opacity-60",
              )}
            />
          ))}
          {/* The brand star: the WORLD page, the last stop of the feed. */}
          <li
            className={cn(
              "mt-1 flex justify-center text-brand-red transition-[opacity,transform] duration-300",
              active === count ? "scale-110 opacity-100" : "opacity-60",
            )}
          >
            <StarMark className="w-3.5" />
          </li>
        </ol>
      ) : null}
    </>
  );
}
