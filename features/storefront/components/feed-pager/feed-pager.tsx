"use client";

import { useEffect } from "react";

// The phone landing as a Reels-style feed, with NO native scrolling at all.
//
// Earlier attempts leaned on the browser's scroll: CSS scroll-snap settles on
// whichever stop is nearest (a short drag snaps back), and scripted
// `scrollTo` fights the browser's momentum and the mobile address bar resizing
// the viewport mid-scroll -- both read as jitter. Here the page cannot scroll:
// the landing's <main> is fixed to the screen on a phone, and the stack of
// stops inside it (`[data-feed-track]`) is moved with a transform. The track
// follows the finger while it is down, and on release ANY swipe -- however
// short -- carries it to the next stop in the direction of the swipe, easing
// there. Nothing else is moving, so nothing can fight it.
//
// Stops are the track's `[data-feed-stop]` elements, plus the bottom of the
// track (the footer is shorter than a screen, so its own top is not reachable).
// Wider than a phone nothing here runs and the page scrolls normally.
const PHONE = "(max-width: 767px)";
// A finger that moved less than this is a tap, not a swipe.
const SWIPE_PX = 8;
// How long the arriving product takes to fade in.
const FADE_MS = 500;
const EASE = "transform 450ms cubic-bezier(0.22, 0.8, 0.3, 1)";
// How far past the first or last stop the track follows the finger (a rubber
// band), as a fraction of the drag.
const RUBBER = 0.3;

// A product page open over the feed (see ProductOverlay) owns the gestures.
function productOpen() {
  return document.body.hasAttribute("data-product-open");
}

export function FeedPager() {
  useEffect(() => {
    const phone = window.matchMedia(PHONE);
    const track = document.querySelector<HTMLElement>("[data-feed-track]");
    if (!track) return;
    const feed = track;

    let points: number[] = [0];
    let index = 0;
    let startY = 0;
    let lastY = 0;
    let dragging = false;

    function measure() {
      const height = feed.parentElement?.clientHeight ?? window.innerHeight;
      const max = Math.max(0, feed.scrollHeight - height);
      const tops = [
        ...feed.querySelectorAll<HTMLElement>("[data-feed-stop]"),
      ].map((element) =>
        Math.min(
          max,
          element.getBoundingClientRect().top -
            feed.getBoundingClientRect().top,
        ),
      );
      points = [...new Set([0, ...tops, max].map(Math.round))].sort(
        (a, b) => a - b,
      );
      index = Math.min(index, points.length - 1);
    }
    // The track's own translation, so stop positions can be read while it is
    // moved (getBoundingClientRect includes the transform).
    function currentOffset() {
      return new DOMMatrixReadOnly(getComputedStyle(feed).transform).m42;
    }

    function place(offset: number, animate: boolean) {
      feed.style.transition = animate ? EASE : "none";
      feed.style.transform = `translate3d(0, ${-offset}px, 0)`;
    }
    // The product the track is moving to fades in over the slide.
    function fadeIn() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const height = feed.parentElement?.clientHeight ?? window.innerHeight;
      const max = Math.max(0, feed.scrollHeight - height);
      const feedTop = feed.getBoundingClientRect().top;
      for (const stop of feed.querySelectorAll<HTMLElement>(
        "[data-feed-stop]",
      )) {
        const top = Math.round(
          Math.min(max, stop.getBoundingClientRect().top - feedTop),
        );
        if (top === points[index]) {
          stop.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: FADE_MS,
            easing: "ease-out",
          });
          return;
        }
      }
    }
    function go(to: number) {
      const before = index;
      index = Math.max(0, Math.min(points.length - 1, to));
      place(points[index], true);
      if (index !== before) fadeIn();
    }

    function enable() {
      feed.style.transform = "";
      feed.style.transition = "";
      index = 0;
      // Measured with the track at rest so the stop tops are its natural ones.
      measure();
      place(points[index], false);
    }
    function disable() {
      feed.style.transform = "";
      feed.style.transition = "";
    }

    function onTouchStart(event: TouchEvent) {
      if (!phone.matches || productOpen() || event.touches.length !== 1) return;
      dragging = true;
      startY = lastY = event.touches[0].clientY;
      // Catch the track where it is if it was still easing, so a new touch
      // takes over from the middle of the move instead of snapping.
      place(-currentOffset(), false);
    }
    function onTouchMove(event: TouchEvent) {
      if (!dragging) return;
      lastY = event.touches[0].clientY;
      if (event.cancelable) event.preventDefault();
      let drag = lastY - startY;
      const atStart = index === 0 && drag > 0;
      const atEnd = index === points.length - 1 && drag < 0;
      if (atStart || atEnd) drag *= RUBBER;
      place(points[index] - drag, false);
    }
    function onTouchEnd() {
      if (!dragging) return;
      dragging = false;
      const moved = startY - lastY;
      go(Math.abs(moved) >= SWIPE_PX ? index + (moved > 0 ? 1 : -1) : index);
    }

    // A trackpad or wheel in a narrow window is the same gesture; one step per
    // gesture, however long the wheel keeps reporting.
    let wheelLocked = false;
    function onWheel(event: WheelEvent) {
      if (
        !phone.matches ||
        productOpen() ||
        event.ctrlKey ||
        event.deltaY === 0
      )
        return;
      event.preventDefault();
      if (wheelLocked) return;
      wheelLocked = true;
      setTimeout(() => (wheelLocked = false), 600);
      go(index + (event.deltaY > 0 ? 1 : -1));
    }
    function onKeyDown(event: KeyboardEvent) {
      if (!phone.matches || productOpen()) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        go(index - 1);
      }
    }
    function onChange() {
      if (phone.matches) enable();
      else disable();
    }
    function onResize() {
      if (!phone.matches) return;
      const at = points[index];
      feed.style.transform = "";
      measure();
      place(points[Math.min(index, points.length - 1)] ?? at, false);
    }

    if (phone.matches) enable();
    phone.addEventListener("change", onChange);
    window.addEventListener("resize", onResize);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      disable();
      phone.removeEventListener("change", onChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
