"use client";

import { useEffect, useState } from "react";

import { createFeedPager } from "@/features/transition";
import { cn } from "@/lib/utils";

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
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = document.querySelector<HTMLElement>("[data-feed-track]");
    if (!track) return;
    const products = [
      ...track.querySelectorAll<HTMLElement>("[data-feed-product]"),
    ];
    return createFeedPager(track, {
      isActive: () => !productOpen(),
      onStep(stop, animated) {
        // None lit on WORLD.
        setActive(stop ? products.indexOf(stop) : -1);
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
  }, []);

  if (count < 2) return null;
  // Phone only; the pager's own rest stops are what it tracks, so it sits with
  // the pager rather than in the catalog.
  return (
    <ol
      aria-hidden
      className="pointer-events-none fixed top-1/2 right-3.5 z-30 flex -translate-y-1/2 flex-col gap-2 md:hidden"
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
    </ol>
  );
}
