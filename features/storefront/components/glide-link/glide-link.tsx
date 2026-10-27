"use client";

import type { ComponentProps } from "react";

import { glideToAnchor } from "../../lib/glide-to-anchor";

// An in-page anchor that glides to its target. The landing hero's front-of-house
// links are server-rendered, so the click handler has to live in a client leaf.
export function GlideLink({
  href,
  ...props
}: Omit<ComponentProps<"a">, "href" | "onClick"> & { href: string }) {
  return (
    <a href={href} onClick={(event) => glideToAnchor(event, href)} {...props} />
  );
}
