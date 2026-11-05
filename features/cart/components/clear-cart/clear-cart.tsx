"use client";

import { useEffect } from "react";

import { useCart } from "../cart-provider/cart-provider";

// Mounted only by the paid order page: an order that went through empties the
// cart, while an abandoned payment (which never reaches that page) leaves it
// exactly as the customer left it.
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
