// A ref callback: when the element it is attached to mounts, bring it into the
// middle of the screen. The card step opens in place of the order controls, and
// on a phone that can be below the fold of a full-height poster.
export function scrollIntoViewOnMount(element: HTMLElement | null) {
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}
