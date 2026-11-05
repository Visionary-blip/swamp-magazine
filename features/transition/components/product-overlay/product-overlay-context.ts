"use client";

import { createContext, useContext } from "react";

// Present only for a product page shown inside the landing's overlay (a phone),
// where "leave this page" means closing the overlay rather than navigating.
const ProductOverlayContext = createContext<{ close: () => void } | null>(null);

export const ProductOverlayProvider = ProductOverlayContext.Provider;

export function useProductOverlay() {
  return useContext(ProductOverlayContext);
}

// HandoffLink -> ProductOverlay, which are siblings rather than parent and
// child, so the request travels as a window event.
export const OPEN_PRODUCT_EVENT = "swamp:open-product";
