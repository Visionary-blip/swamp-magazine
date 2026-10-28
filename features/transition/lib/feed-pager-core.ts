// The phone's "feed" paging, with NO native scrolling at all. Used by the landing
// grid (FeedPager) and by every product page (ProductFeed).
//
// Earlier attempts leaned on the browser's scroll: CSS scroll-snap settles on
// whichever stop is nearest (a short drag snaps back), and scripted
// `scrollTo` fights the browser's momentum and the mobile address bar resizing
// the viewport mid-scroll -- both read as jitter. Here the page cannot scroll:
// the screen's <main> is fixed to the window on a phone, and the stack inside
// it (the feed track) is moved with a transform. The track follows the finger
// while it is down, and on release ANY swipe -- however short -- carries it to
// the next rest point in the direction of the swipe, easing there. Nothing else
// is moving, so nothing can fight it.
//
// Rest points are the tops of the track's `[data-feed-stop]` elements, the
// bottom of the track (a last stop shorter than a screen could not reach its own
// top), and, inside a stop taller than the screen, one more per screenful.
// Wider than a phone nothing here runs and the page scrolls normally.
export const PHONE = "(max-width: 767px)";
// A finger that moved less than this is a tap, not a swipe.
const SWIPE_PX = 8;
const EASE = "transform 450ms cubic-bezier(0.22, 0.8, 0.3, 1)";
// How far past the first or last point the track follows the finger (a rubber
// band), as a fraction of the drag.
const RUBBER = 0.3;

// Window events: the arrow on a product page asks for one step; a control that
// would have scrolled itself into view (the next checkout step, a focused field)
// asks for its element to be brought on screen instead, since the page itself
// cannot scroll here.
export const FEED_STEP_EVENT = "swamp:feed-step";
export const FEED_REVEAL_EVENT = "swamp:feed-reveal";

export type FeedPagerOptions = {
  /** An extra reason to stand down (a page open over this one). */
  isActive?: () => boolean;
  /** The rest stop the track is now on (null between stops), after a step. */
  onStep?: (stop: HTMLElement | null, animated: boolean) => void;
};

export function createFeedPager(
  feed: HTMLElement,
  options: FeedPagerOptions = {},
): () => void {
  const phone = window.matchMedia(PHONE);
  const frame = feed.parentElement ?? document.body;

  let points: number[] = [0];
  // Where the track rests (a point, or wherever a reveal put it).
  let rest = 0;
  let startY = 0;
  let lastY = 0;
  let dragging = false;
  let wasVisible = false;

  function visible() {
    return feed.getClientRects().length > 0;
  }
  // A dialog (the photo viewer) over the page owns the gestures, as does a page
  // open over this one.
  function active() {
    return (
      phone.matches &&
      visible() &&
      !document.querySelector('[role="dialog"]') &&
      options.isActive?.() !== false
    );
  }
  function viewport() {
    return frame.clientHeight || window.innerHeight;
  }
  function maxOffset() {
    return Math.max(0, feed.scrollHeight - viewport());
  }
  // The track's own translation, so layout can be read while it is moved
  // (getBoundingClientRect includes the transform, on both sides of a subtraction).
  function currentOffset() {
    return new DOMMatrixReadOnly(getComputedStyle(feed).transform).m42;
  }

  function measure() {
    const height = viewport();
    const max = maxOffset();
    const feedTop = feed.getBoundingClientRect().top;
    const found = [0, max];
    for (const stop of feed.querySelectorAll<HTMLElement>("[data-feed-stop]")) {
      const box = stop.getBoundingClientRect();
      const top = box.top - feedTop;
      const bottom = top + box.height;
      found.push(Math.min(max, top));
      // A stop taller than the screen is paged through a screenful at a time.
      let at = top;
      while (at + height < bottom - 1) {
        at = Math.min(at + height, bottom - height);
        found.push(Math.min(max, at));
      }
    }
    points = [...new Set(found.map(Math.round))].sort((a, b) => a - b);
  }

  function stopAt(point: number): HTMLElement | null {
    const max = maxOffset();
    const feedTop = feed.getBoundingClientRect().top;
    for (const stop of feed.querySelectorAll<HTMLElement>("[data-feed-stop]")) {
      const top = Math.round(
        Math.min(max, stop.getBoundingClientRect().top - feedTop),
      );
      if (top === Math.round(point)) return stop;
    }
    return null;
  }

  function place(offset: number, animate: boolean) {
    feed.style.transition = animate ? EASE : "none";
    feed.style.transform = `translate3d(0, ${-offset}px, 0)`;
  }
  function settle(offset: number, animated: boolean) {
    const moved = Math.round(offset) !== Math.round(rest);
    rest = offset;
    place(rest, animated);
    if (moved) options.onStep?.(stopAt(rest), animated);
  }
  // The next point past where the track rests, in a direction; none past the
  // ends.
  function pointFrom(direction: 1 | -1): number {
    if (direction > 0) return points.find((p) => p > rest + 1) ?? rest;
    return [...points].reverse().find((p) => p < rest - 1) ?? rest;
  }
  function step(direction: 1 | -1) {
    settle(pointFrom(direction), true);
  }

  function enable() {
    feed.style.transform = "";
    feed.style.transition = "";
    rest = 0;
    // Measured with the track at rest so the tops are its natural ones.
    measure();
    place(rest, false);
    options.onStep?.(stopAt(rest), false);
  }
  function disable() {
    feed.style.transform = "";
    feed.style.transition = "";
    rest = 0;
  }

  function onTouchStart(event: TouchEvent) {
    if (!active() || event.touches.length !== 1) return;
    dragging = true;
    startY = lastY = event.touches[0].clientY;
    // Catch the track where it is if it was still easing, so a new touch takes
    // over from the middle of the move instead of snapping.
    rest = -currentOffset();
    place(rest, false);
  }
  function onTouchMove(event: TouchEvent) {
    if (!dragging) return;
    lastY = event.touches[0].clientY;
    if (event.cancelable) event.preventDefault();
    let drag = lastY - startY;
    const atStart = rest <= points[0] && drag > 0;
    const atEnd = rest >= points[points.length - 1] && drag < 0;
    if (atStart || atEnd) drag *= RUBBER;
    place(rest - drag, false);
  }
  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;
    const moved = startY - lastY;
    if (Math.abs(moved) >= SWIPE_PX) step(moved > 0 ? 1 : -1);
    else settle(rest, true);
  }

  // A trackpad or wheel in a narrow window is the same gesture; one step per
  // gesture, however long the wheel keeps reporting.
  let wheelLocked = false;
  function onWheel(event: WheelEvent) {
    if (!active() || event.ctrlKey || event.deltaY === 0) return;
    event.preventDefault();
    if (wheelLocked) return;
    wheelLocked = true;
    setTimeout(() => (wheelLocked = false), 600);
    step(event.deltaY > 0 ? 1 : -1);
  }
  function onKeyDown(event: KeyboardEvent) {
    if (!active()) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable]")) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      step(-1);
    }
  }
  function onStepEvent(event: Event) {
    if (!active()) return;
    // Cancelled so the sender knows a feed took it (see ScrollCue).
    event.preventDefault();
    step((event as CustomEvent<1 | -1>).detail ?? 1);
  }

  // Brings an element to the middle of the screen, the job `scrollIntoView` does
  // on a page that can scroll.
  function reveal(element: Element) {
    const top =
      element.getBoundingClientRect().top - feed.getBoundingClientRect().top;
    const height = element.getBoundingClientRect().height;
    const target = Math.max(
      0,
      Math.min(maxOffset(), top + height / 2 - viewport() / 2),
    );
    settle(target, true);
  }
  function onRevealEvent(event: Event) {
    const element = (event as CustomEvent<Element>).detail;
    if (!element || !feed.contains(element) || !active()) return;
    event.preventDefault();
    reveal(element);
  }
  function onFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    if (target?.matches("input, textarea, select")) reveal(target);
  }
  // The browser itself scrolls a focused field into view, and a fixed, clipped
  // <main> still scrolls programmatically: keep it at rest so the transform is
  // the only thing that moves.
  function onFrameScroll() {
    if (phone.matches && frame.scrollTop !== 0) frame.scrollTop = 0;
  }

  function onChange() {
    if (phone.matches) enable();
    else disable();
  }
  // The track grows when a step reveals more controls, and a hidden page is
  // measured as nothing: re-read the points, and start from the top whenever the
  // page has just come into view.
  const observer = new ResizeObserver(() => {
    if (!phone.matches) return;
    const nowVisible = visible();
    if (nowVisible && !wasVisible) {
      wasVisible = true;
      enable();
      return;
    }
    wasVisible = nowVisible;
    if (!nowVisible) return;
    measure();
    rest = Math.min(rest, maxOffset());
    place(rest, false);
  });

  if (phone.matches) {
    wasVisible = visible();
    enable();
  }
  phone.addEventListener("change", onChange);
  observer.observe(feed);
  observer.observe(frame);
  frame.addEventListener("scroll", onFrameScroll, { passive: true });
  feed.addEventListener("focusin", onFocusIn);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener(FEED_STEP_EVENT, onStepEvent);
  window.addEventListener(FEED_REVEAL_EVENT, onRevealEvent);
  return () => {
    disable();
    observer.disconnect();
    phone.removeEventListener("change", onChange);
    frame.removeEventListener("scroll", onFrameScroll);
    feed.removeEventListener("focusin", onFocusIn);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener(FEED_STEP_EVENT, onStepEvent);
    window.removeEventListener(FEED_REVEAL_EVENT, onRevealEvent);
  };
}
