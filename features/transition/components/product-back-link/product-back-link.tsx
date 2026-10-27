"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { useProductOverlay } from "../product-overlay/product-overlay-context";

// BACK on a product page: closes the landing's overlay when that is where the
// page is showing, otherwise an ordinary link to the grid.
export function ProductBackLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const overlay = useProductOverlay();
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (overlay && !event.defaultPrevented) {
          event.preventDefault();
          overlay.close();
        }
      }}
    />
  );
}
