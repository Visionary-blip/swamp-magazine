"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { handoffPending } from "../../lib/image-handoff";

// Every route change goes through a quick fade to dark brown: the page being
// left dims to brown as a link is pressed, and the new page fades up out of it
// once it has arrived. One fixed layer over everything, so it works the same for
// links, for the "+ CART +" button's push to the grid, and for the full load
// Stripe sends a buyer back through.
//
// The "out of brown" half needs no state at all: the layer is keyed on the
// pathname, so each new route mounts a fresh one whose animation starts opaque
// and fades to nothing. The "into brown" half is a click listener that covers
// the screen until the pathname changes (or a failsafe gives up).
export function PageVeil() {
  const pathname = usePathname();
  // The path the screen was covered on, or null. It covers only while the
  // location is still that path, so arriving somewhere else uncovers by itself.
  const [coveredOn, setCoveredOn] = useState<string | null>(null);

  useEffect(() => {
    let giveUp: ReturnType<typeof setTimeout> | undefined;

    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const anchor = (event.target as Element | null)?.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      // Only a move to another page: a hash on this page, or an outside site,
      // would cover the screen with nothing coming to uncover it.
      if (
        url.origin !== window.location.origin ||
        url.pathname + url.search ===
          window.location.pathname + window.location.search
      ) {
        return;
      }
      setCoveredOn(window.location.pathname);
      clearTimeout(giveUp);
      giveUp = setTimeout(() => setCoveredOn(null), 2000);
    }

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(giveUp);
    };
  }, []);

  const covering = coveredOn === pathname;

  return (
    <div
      key={pathname}
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] bg-brown",
        covering
          ? "opacity-100 transition-opacity duration-150 ease-in"
          : cn(
              "opacity-0",
              // A garment is flying across (see image-handoff): fade the page up
              // around it at the pace of its flight.
              handoffPending() ? "animate-veil-out-slow" : "animate-veil-out",
            ),
      )}
    />
  );
}
