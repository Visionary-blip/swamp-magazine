"use client";

import { useEffect, useState, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

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

  // Pressing the arrow glides to the section rather than jumping: a slow
  // ease-in-out (about two seconds for a screen's distance), cancelled
  // the moment the visitor scrolls, touches or types. With reduced motion it
  // jumps, as an ordinary anchor does.
  function glideToTarget(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.querySelector(href);
    if (
      !target ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    event.preventDefault();

    const from = window.scrollY;
    const to = from + target.getBoundingClientRect().top;
    const distance = to - from;
    const duration = Math.min(3000, Math.max(1500, Math.abs(distance) * 2.2));
    const started = performance.now();
    let frame = 0;

    function stop() {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    }
    function step(now: number) {
      const progress = Math.min(1, (now - started) / duration);
      // Ease-in-out sine: gentle at both ends, no sharp middle.
      const eased = -(Math.cos(Math.PI * progress) - 1) / 2;
      window.scrollTo(0, from + distance * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
      else stop();
    }

    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    frame = requestAnimationFrame(step);
  }

  return (
    <a
      href={href}
      onClick={glideToTarget}
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
