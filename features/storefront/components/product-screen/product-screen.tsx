import Image from "next/image";
import Link from "next/link";

import { CheckoutForm } from "@/features/checkout";

import type { ProductDetail } from "../../lib/catalog";
import { storefrontCopy } from "../../lib/storefront-copy";
import { SiteFooter } from "../site-footer/site-footer";

// The founder's order poster: the shoot full-bleed, the garment's cutout dead
// centre, red Helvetica set straight onto the photograph. The grid is three
// columns by three rows -- BACK and the model credits across the top, delivery
// left and the order right either side of the cutout, name and sizes under it.
// CheckoutForm supplies the middle and bottom pieces as grid items (see its
// header); below `md` the same pieces simply stack, centred.
export function ProductScreen({ product }: { product: ProductDetail }) {
  return (
    <main className="bg-ink">
      <div className="relative isolate flex min-h-dvh flex-col items-stretch gap-8 overflow-hidden bg-ink px-5 py-6 md:grid md:grid-cols-[1fr_auto_1fr] md:grid-rows-[auto_1fr_auto] md:gap-x-10 md:px-16 md:py-12">
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

        {/* `md:contents` lifts both children into the poster grid, where BACK
            takes the top-left cell and the credits the top-right. */}
        <div className="flex items-start justify-between gap-4 md:contents">
          <Link
            href="/"
            className="brat text-3xl text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:col-start-1 md:row-start-1 md:text-3xl lg:text-5xl"
          >
            {storefrontCopy.back}
          </Link>
          {/* The founder's credit line, from the DB rather than from any
              mockup shorthand -- `products.model_credits` is the source. */}
          {product.modelCredits ? (
            <p className="brat text-right text-xl whitespace-pre-line text-brand-red md:col-start-3 md:row-start-1 md:text-2xl lg:text-4xl">
              {product.modelCredits}
            </p>
          ) : null}
        </div>

        {product.cutout ? (
          <div className="relative mx-auto aspect-square w-[72vw] max-w-[420px] md:col-start-2 md:row-start-2 md:w-[min(34vw,460px)] md:max-w-none md:self-center">
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
