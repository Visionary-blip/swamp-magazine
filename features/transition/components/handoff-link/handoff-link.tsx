"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

import { beginHandoff, PHONE } from "../../lib/image-handoff";

// A product tile's link. On a phone the tapped tile's image (anything marked
// `data-handoff`) is handed to the next page so it stays on screen through the
// transition; everywhere else it is a plain link.
export function HandoffLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !window.matchMedia(PHONE).matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const image =
      event.currentTarget.querySelector<HTMLImageElement>("[data-handoff] img");
    if (image) beginHandoff(image);
  }
  return <Link {...props} onClick={handleClick} />;
}
