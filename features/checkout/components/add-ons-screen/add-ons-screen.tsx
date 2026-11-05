"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { CartCorner, useCart } from "@/features/cart";
import type { AddOn } from "@/features/storefront";

import { formatUsd } from "../../lib/order-copy";

// The step between the cart corner and the cart page: each add-on gets the
// poster a garment gets (the founder's photograph, the cutout dead centre, the
// name, price and buttons stacked below) and the customer either adds it or goes
// straight on. Add-ons are only sold with a real garment, so an empty cart has
// nothing to do here and moves on.
const subscribeNothing = () => () => {};

export function AddOnsScreen({ addOns }: { addOns: AddOn[] }) {
  const router = useRouter();
  const cart = useCart();
  const { items } = cart;
  // The server render sees an empty cart; only once mounted is it the real one.
  const mounted = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  // A desktop page: a phone that lands here is sent on to the cart.
  useEffect(() => {
    if (!mounted) return;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    if (phone || items.length === 0) router.replace("/checkout");
  }, [mounted, items.length, router]);

  // ADD TO CHECKOUT: whatever add-on is on offer goes into the order, then the
  // cart page (NO THANKS is a plain link there). One already in the cart is not added twice, and one that has run
  // out is skipped rather than refused later.
  function handleCheckout() {
    for (const addOn of addOns) {
      if (addOn.soldOut || items.some((item) => item.slug === addOn.slug)) {
        continue;
      }
      cart.addItem({
        slug: addOn.slug,
        size: addOn.size,
        sizes: [],
        quantity: 1,
        name: addOn.name,
        priceCents: addOn.priceCents,
        cutoutUrl: addOn.cutout?.url ?? null,
        cutoutAlt: addOn.cutout?.alt ?? "",
        addOn: true,
      });
    }
    router.push("/checkout");
  }

  return (
    <main className="relative isolate flex min-h-dvh flex-col bg-ink max-md:hidden">
      <Image
        src="/add-ons/background.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-ink/40" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-ink/70 to-transparent" />
      <div className="flex items-start justify-between gap-4 px-5 py-6 md:px-16 md:py-12">
        <Link
          href="/#products"
          className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
        >
          BACK
        </Link>
        <CartCorner placement="inline" />
      </div>
      {/* One column with one gap, so the picture, name, price and buttons are
          all the same distance apart; the stack sits low, clear of the music button, with the room above. */}
      <section className="flex grow flex-col items-center justify-end gap-6 px-5 pb-[4.5rem] md:px-16">
        {addOns.map((addOn) => (
          <div key={addOn.slug} className="contents">
            {addOn.cutout ? (
              <div className="relative mx-auto aspect-square w-[45vw] max-w-[262px] md:w-[min(21.25vw,22.5dvh)] md:max-w-none">
                <Image
                  src={addOn.cutout.url}
                  alt={addOn.cutout.alt || addOn.name}
                  fill
                  priority
                  sizes="(min-width: 768px) 22vw, 45vw"
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            ) : null}
            <h1 className="brat text-brand-red">{addOn.name}</h1>
            <p className="brat text-brand-red">{formatUsd(addOn.priceCents)}</p>
          </div>
        ))}
        <div className="flex justify-center gap-10">
          <Link
            href="/checkout"
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            NO THANKS
          </Link>
          <button
            type="button"
            onClick={handleCheckout}
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            ADD TO CHECKOUT
          </button>
        </div>
      </section>
    </main>
  );
}
