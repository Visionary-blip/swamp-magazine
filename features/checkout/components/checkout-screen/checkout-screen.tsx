import Image from "next/image";
import Link from "next/link";

import type { AddOn } from "@/features/storefront";

import { CartCheckout } from "../cart-checkout/cart-checkout";

// The cart page: the founder's photograph full-bleed behind it, under a scrim so
// the red type reads, BACK top-left to the grid, and the whole cart centred in
// the middle of the screen. There is no cart corner here: the page is the cart,
// and each garment has its own quantity buttons.
export function CheckoutScreen({ addOns }: { addOns: AddOn[] }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col gap-6 overflow-hidden bg-ink px-5 py-6 md:px-16 md:py-12">
      <Image
        src="/checkout/cart-background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-ink/55" />
      <div className="flex items-start justify-between gap-4">
        <Link
          href="/#products"
          className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
        >
          BACK
        </Link>
      </div>
      <div className="flex grow items-center justify-center">
        <CartCheckout addOns={addOns} />
      </div>
    </main>
  );
}
