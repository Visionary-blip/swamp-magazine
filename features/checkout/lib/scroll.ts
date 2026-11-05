import { FEED_REVEAL_EVENT, PHONE } from "@/features/transition";

// A ref callback: when the element it is attached to mounts, bring it into the
// middle of the screen. The card step opens in place of the order controls, and
// on a phone that can be below the fold of a full-height poster.
export function scrollIntoViewOnMount(element: HTMLElement | null) {
  if (!element) return;
  // A phone's product page is paged, not scrolled: its feed, if there is one,
  // brings the element on screen (and cancels the event to say so).
  const handled =
    window.matchMedia(PHONE).matches &&
    !window.dispatchEvent(
      new CustomEvent(FEED_REVEAL_EVENT, { detail: element, cancelable: true }),
    );
  if (!handled) element.scrollIntoView({ behavior: "smooth", block: "center" });
}
