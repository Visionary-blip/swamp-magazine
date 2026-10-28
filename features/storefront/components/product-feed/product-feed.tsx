"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { createFeedPager } from "@/features/transition";

// A product page, paged the way the landing grid is on a phone: the screen is
// pinned to the window and its poster and photographs are stops a swipe moves
// between, so nothing peeks in under the poster. From md up it is a plain
// scrolling page.
export function ProductFeed({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(
    () => (track.current ? createFeedPager(track.current) : undefined),
    [],
  );

  return (
    <main className="bg-ink max-md:fixed max-md:inset-0 max-md:overflow-hidden">
      <div ref={track}>{children}</div>
    </main>
  );
}
