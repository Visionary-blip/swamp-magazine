"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// How far a tile's pile is fanned: each tile is turned and nudged a little, by
// its place in the grid, so the pile looks dropped rather than stacked.
const PILE_SCALE = 0.86;

function pileJitter(index: number): { x: number; y: number; turn: number } {
  return {
    x: ((index * 29) % 41) - 20,
    y: ((index * 17) % 31) - 15,
    turn: ((index * 37) % 13) - 6,
  };
}

// One issue's grid of tiles. From md up, while the visitor is not looking at it
// (it is out of the middle of the screen) its tiles lie in a loose pile at the
// grid's centre, and when it scrolls into the middle they spread out to their
// cells. The pile is only transforms on the tiles, so the layout, the links and
// what a phone gets (no pile at all) are the plain grid underneath.
//
// `holdWhenLeftBelow`: leaving through the bottom of the screen means the visitor
// scrolled up, away from the grid. The grid that has this keeps its spread then
// (the National issue, under the hero, on the way back up to the landing page);
// the others pile back up. Every grid starts piled and spreads on arrival.
export function IssueGrid({
  className,
  children,
  holdWhenLeftBelow = false,
}: {
  className: string;
  children: ReactNode;
  holdWhenLeftBelow?: boolean;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [piled, setPiled] = useState(false);
  const [enabled, setEnabled] = useState(false);

  // The pile is a desktop thing, and not for anyone who asked for less motion.
  useEffect(() => {
    const query = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Looking at it = any of it in the middle 60% of the screen.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !enabled) return;
    let seen = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          seen = true;
          setPiled(false);
          return;
        }
        const leftBelow =
          entry.rootBounds !== null &&
          entry.boundingClientRect.top >= entry.rootBounds.bottom;
        if (holdWhenLeftBelow && seen && leftBelow) return;
        setPiled(true);
      },
      { rootMargin: "-20% 0px -20% 0px", threshold: 0 },
    );
    observer.observe(list);
    return () => {
      observer.disconnect();
      setPiled(false);
    };
  }, [enabled, holdWhenLeftBelow]);

  // Lay the tiles on the pile, or put them back. Measured from the untransformed
  // layout (offsets), so it is right whichever state the tiles are in.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const tiles = Array.from(list.children) as HTMLElement[];
    const place = () => {
      if (!enabled || !piled) {
        tiles.forEach((tile, index) => {
          tile.style.transform = "";
          tile.style.transitionDelay = `${index * 45}ms`;
        });
        return;
      }
      const centres = tiles.map((tile) => ({
        x: tile.offsetLeft + tile.offsetWidth / 2,
        y: tile.offsetTop + tile.offsetHeight / 2,
      }));
      const middleX =
        (Math.min(...centres.map((c) => c.x)) +
          Math.max(...centres.map((c) => c.x))) /
        2;
      const middleY =
        (Math.min(...centres.map((c) => c.y)) +
          Math.max(...centres.map((c) => c.y))) /
        2;
      tiles.forEach((tile, index) => {
        const jitter = pileJitter(index);
        tile.style.transitionDelay = "0ms";
        tile.style.transform = `translate(${middleX - centres[index].x + jitter.x}px, ${middleY - centres[index].y + jitter.y}px) rotate(${jitter.turn}deg) scale(${PILE_SCALE})`;
      });
    };
    place();
    if (!enabled || !piled) return;
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [enabled, piled]);

  return (
    <ul
      ref={listRef}
      data-piled={enabled && piled ? "true" : "false"}
      className={className}
    >
      {children}
    </ul>
  );
}
