import Link from "next/link";

import { cn } from "@/lib/utils";

import type {
  ProductNeighbor,
  ProductNeighbors,
} from "../../lib/product-neighbors";

// The two arrows at the sides of a product's poster that step to the previous
// and the next product, drawn like the scroll cue under the title (same red,
// same yellow on hover, same gentle bob, here sideways). From md up only: a
// phone swipes instead (see ProductFeed). An end of the line has no arrow.
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
      className={cn(
        "absolute top-1/2 z-[5] hidden size-12 -translate-y-1/2 items-center justify-center rounded-full text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:flex",
        previous ? "left-4 lg:left-8" : "right-4 lg:right-8",
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
