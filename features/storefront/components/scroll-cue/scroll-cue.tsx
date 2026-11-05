"use client";

import { useEffect, useState } from "react";

import { FEED_STEP_EVENT, PHONE } from "@/features/transition";
import { cn } from "@/lib/utils";

import { glideToAnchor } from "../../lib/glide-to-anchor";

// A small bobbing arrow that says "there is more below". It fades out once the
// page has been scrolled and returns if the visitor goes back to the top, and it
// is a link to the section it points at, so clicking it does the scrolling. On a
// phone the page is paged rather than scrolled (see createFeedPager): the arrow
// sits on the screen it belongs to and leaves with it, and a tap on it steps to
// the next screen.
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
      onClick={(event) => {
        // A phone's feed takes the step itself (and cancels the event to say
        // so); anywhere else the anchor glides.
        if (
          window.matchMedia(PHONE).matches &&
          !window.dispatchEvent(
            new CustomEvent(FEED_STEP_EVENT, { detail: 1, cancelable: true }),
          )
        ) {
          event.preventDefault();
          return;
        }
        glideToAnchor(event, href);
      }}
      aria-label={label}
      className={cn(
        "flex items-center justify-center text-brand-red transition-opacity duration-300 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none",
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
