"use client";

import Link from "next/link";

import { PHONE } from "@/features/transition";
import { cn } from "@/lib/utils";

import type {
  ProductNeighbor,
  ProductNeighbors,
} from "../../lib/product-neighbors";
import { PRODUCT_STEP_EVENT } from "../product-feed/product-feed";

// The two arrows at the sides of a product's poster that step to the previous
// and the next product, drawn like the scroll cue under the title (same red,
// same yellow on hover, same gentle bob, here sideways). They are on a phone too,
// where a swipe does the same; a tap on one slides the page the way a swipe
// does. An end of the line has no arrow.
export function ProductNeighborArrows({
  neighbors,
}: {
  neighbors: ProductNeighbors;
}) {
  return (
    <>
      {neighbors.previous ? (
        <Arrow neighbor={neighbors.previous} direction="previous" />
      ) : null}
      {neighbors.next ? (
        <Arrow neighbor={neighbors.next} direction="next" />
      ) : null}
    </>
  );
}

function Arrow({
  neighbor,
  direction,
}: {
  neighbor: ProductNeighbor;
  direction: "previous" | "next";
}) {
  const previous = direction === "previous";
  return (
    <Link
      href={`/product/${neighbor.slug}`}
      aria-label={`${previous ? "Previous" : "Next"} product: ${neighbor.name}`}
      title={neighbor.name}
      onClick={(event) => {
        // A phone's page takes the step itself, sliding (and, inside the
        // landing's overlay, staying on the landing); anywhere else the link
        // navigates.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !window.matchMedia(PHONE).matches
        ) {
          return;
        }
        event.preventDefault();
        window.dispatchEvent(
          new CustomEvent(PRODUCT_STEP_EVENT, { detail: previous ? -1 : 1 }),
        );
      }}
      className={cn(
        "absolute top-1/2 z-[5] flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:size-12",
        previous
          ? "left-0.5 md:left-4 lg:left-8"
          : "right-0.5 md:right-4 lg:right-8",
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 10 16"
        className={cn(
          "h-5 w-3",
          previous ? "animate-cue-bob-left" : "animate-cue-bob-right",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={previous ? "M8.5 1.5L2 8l6.5 6.5" : "M1.5 1.5L8 8l-6.5 6.5"} />
      </svg>
    </Link>
  );
}
