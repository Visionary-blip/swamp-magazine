import Image from "next/image";
import Link from "next/link";

import { CartCorner } from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { cn } from "@/lib/utils";

import type { ProductDetail } from "../../lib/catalog";
import { parseModelCredits } from "../../lib/model-credits";
import { getProductGallery } from "../../lib/product-gallery";
import { storefrontCopy } from "../../lib/storefront-copy";
import { ProductGallery } from "../product-gallery/product-gallery";
import { ScrollCue } from "../scroll-cue/scroll-cue";

// The founder's order poster: the shoot full-bleed, the garment's cutout dead
// centre, red Anton set straight onto the photograph. BACK and the model
// credits sit across the top; size, delivery and place order are stacked,
// centred, along the bottom (CheckoutForm). All of it is one type size.
export function ProductScreen({ product }: { product: ProductDetail }) {
  const gallery = getProductGallery(product.slug);
  const hasGallery = gallery.length > 0;

  return (
    <main className="bg-ink">
      <div
        className={cn(
          "relative isolate flex flex-col gap-6 overflow-hidden bg-ink px-5 py-6 md:min-h-dvh md:px-16 md:py-12",
          // With photographs below, the poster stops short of the fold on a
          // phone so the first of them peeks in -- the cue to keep scrolling.
          hasGallery ? "min-h-[88dvh]" : "min-h-dvh",
        )}
      >
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
            {/* A deeper wash behind the order controls at the foot, where the
                red type sits over whatever the photograph has there. */}
            <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-ink/70 to-transparent" />
          </>
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <Link
            href="/#products"
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            {storefrontCopy.back}
          </Link>
          {/* The cart sits above the founder's credit line, in the same corner,
              so a filled cart pushes the credits down instead of covering
              them. */}
          <div className="flex flex-col items-end gap-3">
            <CartCorner placement="inline" />
            {/* The founder's credit line, from the DB rather than from any
                mockup shorthand -- `products.model_credits` is the source. */}
            {product.modelCredits ? (
              <ul className="brat text-right text-brand-red">
                {parseModelCredits(product.modelCredits).map((credit) => (
                  <li key={credit.text}>
                    {credit.href ? (
                      <a
                        href={credit.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
                      >
                        {credit.text}
                      </a>
                    ) : (
                      credit.text
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {product.cutout ? (
          <div className="relative mx-auto my-auto aspect-square w-[72vw] max-w-[420px] md:w-[min(34vw,36dvh)] md:max-w-none">
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
          cutout={product.cutout}
        />

        {/* Desktop only: a small arrow to the photographs below. */}
        {hasGallery ? (
          <ScrollCue
            href="#gallery"
            label="Scroll to the photographs"
            className="absolute bottom-1 left-1/2 size-8 -translate-x-1/2"
          />
        ) : null}
      </div>

      <ProductGallery images={gallery} />
    </main>
  );
}
