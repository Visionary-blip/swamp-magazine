"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

import {
  createFeedPager,
  OPEN_PRODUCT_EVENT,
  useProductOverlay,
} from "@/features/transition";

import type { ProductNeighbors } from "../../lib/product-neighbors";

// A product page, paged the way the landing grid is on a phone: the screen is
// pinned to the window and its poster and photographs are stops a swipe moves
// between, so nothing peeks in under the poster. From md up it is a plain
// scrolling page.
//
// A swipe to the side steps to the neighbouring product: left for the next, right
// for the previous. Inside the landing's overlay that swaps the open page in place;
// on a page of its own it is a navigation.
export function ProductFeed({
  children,
  neighbors,
}: {
  children: ReactNode;
  neighbors: ProductNeighbors;
}) {
  const track = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const overlay = useProductOverlay();
  // Read at swipe time, so the pager (set up once) always sees the current ones.
  const latest = useRef({ neighbors, router, inOverlay: overlay !== null });
  useEffect(() => {
    latest.current = { neighbors, router, inOverlay: overlay !== null };
  });

  useEffect(() => {
    if (!track.current) return;
    return createFeedPager(track.current, {
      onSideSwipe(direction) {
        const { neighbors: now, router: nav, inOverlay } = latest.current;
        const target = direction > 0 ? now.next : now.previous;
        if (!target) return;
        if (inOverlay) {
          window.dispatchEvent(
            new CustomEvent(OPEN_PRODUCT_EVENT, { detail: target.slug }),
          );
        } else {
          nav.push(`/product/${target.slug}`);
        }
      },
    });
  }, []);

  return (
    <main className="bg-ink max-md:fixed max-md:inset-0 max-md:overflow-hidden">
      <div ref={track}>{children}</div>
    </main>
  );
}
