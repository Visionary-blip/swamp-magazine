"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

import {
  createFeedPager,
  OPEN_PRODUCT_EVENT,
  PHONE,
  useProductOverlay,
} from "@/features/transition";

import type { ProductNeighbors } from "../../lib/product-neighbors";

// A tap on a side arrow asks the page that is on screen to step, so it slides
// like a swipe does. `detail` is 1 for the next product, -1 for the previous.
export const PRODUCT_STEP_EVENT = "swamp:product-step";

// The same easing as the rows' vertical paging (see createFeedPager).
const EASE_CURVE = "cubic-bezier(0.22, 0.8, 0.3, 1)";
const SLIDE_OUT = `transform 300ms ${EASE_CURVE}`;
const SLIDE_IN_MS = 380;
// A swipe that travels this far turns the page; a shorter one settles back.
const COMMIT_PX = 56;
// How far the page follows a finger that is pulling past the first or last
// product, as a fraction of the drag.
const RUBBER = 0.3;

// Which way the page now arriving slides in from (1: from the right, as the
// next product does), set by the page that is leaving. Module state, because
// the page that picks it up is a different component instance.
let arrival: 1 | -1 | null = null;

// A product page, paged the way the landing grid is on a phone: the screen is
// pinned to the window and its poster and photographs are stops a swipe moves
// between, so nothing peeks in under the poster. From md up it is a plain
// scrolling page.
//
// A swipe to the side steps to the neighbouring product, left for the next and
// right for the previous. The page follows the finger, and on release it eases
// off the screen while the next one eases in. Inside the landing's overlay the
// open page is swapped in place; on a page of its own it is a navigation.
export function ProductFeed({
  children,
  neighbors,
}: {
  children: ReactNode;
  neighbors: ProductNeighbors;
}) {
  const frame = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const overlay = useProductOverlay();
  const inOverlay = overlay !== null;
  // Read at gesture time, so the listeners (set up once) see the current ones.
  const latest = useRef({ neighbors, router, inOverlay });
  useEffect(() => {
    latest.current = { neighbors, router, inOverlay };
  });
  // A page already moving off the screen takes no further gesture.
  const leaving = useRef(false);

  // The next product's page, ready before the swipe asks for it.
  const nextSlug = neighbors.next?.slug;
  const previousSlug = neighbors.previous?.slug;
  useEffect(() => {
    if (inOverlay || !window.matchMedia(PHONE).matches) return;
    if (nextSlug) router.prefetch(`/product/${nextSlug}`);
    if (previousSlug) router.prefetch(`/product/${previousSlug}`);
  }, [inOverlay, nextSlug, previousSlug, router]);

  // Slides this page in from the side the last one left towards.
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;

    function slideIn() {
      if (arrival === null || !element) return;
      const from = arrival;
      arrival = null;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      element.animate(
        [
          { transform: `translate3d(${from * 100}%, 0, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        { duration: SLIDE_IN_MS, easing: EASE_CURVE },
      );
    }

    // A page of its own mounts already on screen; in the overlay every product
    // is mounted and hidden, and this one is shown when it is swiped to.
    let visible = false;
    function check() {
      const now = !!element && element.getClientRects().length > 0;
      if (now && !visible) slideIn();
      visible = now;
    }
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = frame.current;
    if (!element || !track.current) return;
    const page = element;

    function neighbor(direction: 1 | -1) {
      const now = latest.current.neighbors;
      return direction > 0 ? now.next : now.previous;
    }

    function rest() {
      page.style.transition = SLIDE_OUT;
      page.style.transform = "translate3d(0, 0, 0)";
      setTimeout(() => {
        page.style.transition = "";
        page.style.transform = "";
      }, 320);
    }

    // Carries the page off the screen, then brings up the neighbour.
    function step(direction: 1 | -1) {
      const target = neighbor(direction);
      if (!target || leaving.current) return;
      const { router: nav, inOverlay: overlaid } = latest.current;
      leaving.current = true;
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      function go() {
        if (!target) return;
        arrival = direction;
        // Not left standing if the page never arrives.
        setTimeout(() => (arrival = null), 2000);
        if (overlaid) {
          window.dispatchEvent(
            new CustomEvent(OPEN_PRODUCT_EVENT, { detail: target.slug }),
          );
        } else {
          nav.push(`/product/${target.slug}`);
        }
        // Back in place for the next time this page is shown (it is hidden by
        // now, or gone).
        setTimeout(() => {
          page.style.transition = "";
          page.style.transform = "";
          leaving.current = false;
        }, 600);
      }

      if (reduced) {
        go();
        return;
      }
      page.style.transition = SLIDE_OUT;
      page.style.transform = `translate3d(${-direction * 100}%, 0, 0)`;
      setTimeout(go, 280);
    }

    function visible() {
      return page.getClientRects().length > 0;
    }
    function onStep(event: Event) {
      if (!visible()) return;
      step((event as CustomEvent<1 | -1>).detail);
    }
    window.addEventListener(PRODUCT_STEP_EVENT, onStep);

    const stop = createFeedPager(track.current, {
      side: {
        drag(dx) {
          if (leaving.current) return;
          // Past the first or last product the page pulls back on the finger.
          const x = neighbor(dx < 0 ? 1 : -1) ? dx : dx * RUBBER;
          page.style.transition = "none";
          page.style.transform = `translate3d(${x}px, 0, 0)`;
        },
        release(dx) {
          if (leaving.current) return;
          const direction = dx < 0 ? 1 : -1;
          if (Math.abs(dx) >= COMMIT_PX && neighbor(direction)) step(direction);
          else rest();
        },
      },
    });
    return () => {
      stop();
      window.removeEventListener(PRODUCT_STEP_EVENT, onStep);
    };
  }, []);

  return (
    <main
      ref={frame}
      className="bg-ink max-md:fixed max-md:inset-0 max-md:overflow-hidden"
    >
      <div ref={track}>{children}</div>
    </main>
  );
}
