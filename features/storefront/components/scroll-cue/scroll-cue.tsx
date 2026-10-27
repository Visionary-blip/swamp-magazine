"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { glideToAnchor } from "../../lib/glide-to-anchor";

// A small bobbing arrow that says "there is more below" -- for desktop only.
// On a phone the next section simply peeks in under the fold, and a thumb
// already knows how to scroll; a mouse user has no such cue, so this is theirs.
// It fades out once the page has been scrolled and returns if the visitor goes
// back to the top, and it is a link to the section it points at, so clicking it
// does the scrolling.
export function ScrollCue({
  href,
  label,
  className,
}: {
  href: string;
  /** The accessible name. */
  label: string;
  className?: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    // Checked once on the next frame too, for a page restored part-way down.
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <a
      href={href}
      onClick={(event) => glideToAnchor(event, href)}
      aria-label={label}
      className={cn(
        "hidden items-center justify-center text-brand-red transition-opacity duration-300 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:flex",
        "size-10 rounded-full",
        scrolled && "pointer-events-none opacity-0",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 10"
        className="animate-cue-bob h-3 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1.5 1.5l6.5 6.5 6.5-6.5" />
      </svg>
    </a>
  );
}
