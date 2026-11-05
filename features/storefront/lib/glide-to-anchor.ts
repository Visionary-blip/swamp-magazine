import type { MouseEvent } from "react";

// Pressing an in-page link glides to its section rather than jumping: a slow
// ease-in-out (about a second for a screen's distance), cancelled the moment
// the visitor scrolls, touches or types. With reduced motion it jumps, as an
// ordinary anchor does.
export function glideToAnchor(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
) {
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
  const duration = Math.min(1500, Math.max(750, Math.abs(distance) * 1.1));
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
