"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { storefrontCopy } from "../../lib/storefront-copy";

// Drawn up from the three-across tile size, so the pile fills the screen's
// middle; less on a short screen.
const PILE_SCALE = 1.7;
const PILE_SCALE_PER_HEIGHT_PX = 1 / 440;
// How far each garment stands above the one in front of it, so the stack reads
// as many pieces rather than one.
const PILE_STEP_PX = 14;
// The gap between one garment leaving the pile and the next.
const STAGGER_MS = 30;

// A phone opens on one pile of every garment, and a tap anywhere spreads them
// out into the grid. As on the wide screen (IssueGrid), the pile is only
// transforms on the tiles, so the grid underneath is the plain one. It sits
// inside the products section and marks the landing's <main> with
// `data-spread`, which the names and prices follow.
export function PhonePile() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    const section = buttonRef.current?.parentElement;
    const main = section?.closest("main");
    if (!section || !main || spread) return;
    // No pile for anyone who asked for less motion, or who came back by a
    // "shop" link and has the products to get to.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.location.hash === "#products"
    ) {
      // A frame later: an effect may not set state as it runs.
      const frame = requestAnimationFrame(() => setSpread(true));
      return () => cancelAnimationFrame(frame);
    }
    const tiles = Array.from(
      section.querySelectorAll<HTMLElement>("[data-feed-product]"),
    );
    // The wide screen's tiles are IssueGrid's to move, so only what was piled
    // here is ever put back.
    let piled = false;
    const clear = () => {
      if (!piled) return;
      piled = false;
      for (const tile of tiles) {
        tile.style.transition = "";
        tile.style.transform = "";
      }
    };
    const place = () => {
      if (!window.matchMedia("(max-width: 767px)").matches) {
        clear();
        return;
      }
      piled = true;
      const scale = Math.min(
        PILE_SCALE,
        window.innerHeight * PILE_SCALE_PER_HEIGHT_PX,
      );
      const middleX = section.clientWidth / 2;
      const middleY = window.innerHeight / 2;
      tiles.forEach((tile, index) => {
        // Upright and in line, the whole stack centred on the middle.
        const rise = (index - (tiles.length - 1) / 2) * PILE_STEP_PX;
        const x = middleX - (tile.offsetLeft + tile.offsetWidth / 2);
        const y = middleY - (tile.offsetTop + tile.offsetHeight / 2);
        // Laid at once: the pile is the first thing seen, not a move to watch.
        tile.style.transition = "none";
        // The first of the catalog lies on top.
        tile.style.zIndex = String(tiles.length - index);
        tile.style.transform = `translate(${x}px, ${y - rise}px) scale(${scale})`;
      });
    };
    place();
    main.dataset.placed = "true";
    window.addEventListener("resize", place);
    // The one-at-a-time feed has no pile, should the view change under it.
    const viewWatcher = new MutationObserver(() => {
      if (main.dataset.view !== "grid") setSpread(true);
    });
    viewWatcher.observe(main, { attributeFilter: ["data-view"] });
    return () => {
      window.removeEventListener("resize", place);
      viewWatcher.disconnect();
      const spreading = piled;
      clear();
      if (spreading) {
        tiles.forEach((tile, index) => {
          tile.style.transitionDelay = `${index * STAGGER_MS}ms`;
        });
      }
    };
  }, [spread]);

  useEffect(() => {
    const main = buttonRef.current?.closest("main");
    if (!main) return;
    main.dataset.spread = String(spread);
    // The tiles are kept unseen until they are where they belong.
    if (spread) main.dataset.placed = "true";
  }, [spread]);

  return (
    <>
      {/* No visible words; the name is still the screen's heading. */}
      <h1 className="sr-only md:hidden">{storefrontCopy.wordmark}</h1>
      {/* Over the pile while it is one, so a tap spreads it rather than opening
          whichever garment happens to be on top. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.currentTarget.parentElement?.scrollIntoView({
            behavior: "smooth",
          });
          setSpread(true);
        }}
        aria-label="Spread out the clothes"
        className={cn(
          "absolute inset-0 z-20 hidden",
          !spread && "max-md:group-data-[view=grid]/landing:block",
        )}
      />
    </>
  );
}
