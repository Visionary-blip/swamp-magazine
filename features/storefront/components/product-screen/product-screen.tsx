import Image from "next/image";
import Link from "next/link";

import { CheckoutForm } from "@/features/checkout";

import type { ProductDetail } from "../../lib/catalog";
import { storefrontCopy } from "../../lib/storefront-copy";
import { SiteFooter } from "../site-footer/site-footer";

// The founder's order poster: the shoot full-bleed, the garment's cutout dead
// centre, red Helvetica set straight onto the photograph. BACK and the model
// credits sit across the top; size, delivery and place order are stacked,
// centred, along the bottom (CheckoutForm). All of it is one type size.
export function ProductScreen({ product }: { product: ProductDetail }) {
  return (
    <main className="bg-ink">
      <div className="relative isolate flex min-h-dvh flex-col gap-6 overflow-hidden bg-ink px-5 py-6 md:px-16 md:py-12">
        {/* Background first, solid ink under it: a missing image degrades to a
            plain ink poster rather than a hole. The scrim is what keeps red
            type readable on the lighter shoots. */}
        {product.background ? (
          <>
            <Image
              src={product.background.url}
              alt={product.background.alt}
              fill
              priority
              sizes="100vw"
              className="-z-20 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-ink/40" />
          </>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <Link
            href="/"
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            {storefrontCopy.back}
          </Link>
          {/* The founder's credit line, from the DB rather than from any
              mockup shorthand -- `products.model_credits` is the source. */}
          {product.modelCredits ? (
            <p className="brat text-right whitespace-pre-line text-brand-red">
              {product.modelCredits}
            </p>
          ) : null}
        </div>

        {product.cutout ? (
          <div className="relative mx-auto my-auto aspect-square w-[72vw] max-w-[420px] md:w-[min(34vw,420px)] md:max-w-none">
            <Image
              src={product.cutout.url}
              alt={product.cutout.alt}
              fill
              priority
              sizes="(min-width: 768px) 34vw, 72vw"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        ) : null}

        <CheckoutForm
          slug={product.slug}
          name={product.name}
          priceCents={product.priceCents}
          variants={product.variants}
        />
      </div>

      <SiteFooter />
    </main>
  );
}
