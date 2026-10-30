import Image from "next/image";

import { CartCorner } from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { HandoffTarget, ProductBackLink } from "@/features/transition";
import { cn } from "@/lib/utils";

import type { ProductDetail } from "../../lib/catalog";
import { parseModelCredits } from "../../lib/model-credits";
import { getModelFit } from "../../lib/model-fit";
import { getProductGallery } from "../../lib/product-gallery";
import { storefrontCopy } from "../../lib/storefront-copy";
import { ModelFitButton } from "../model-fit/model-fit-button";
import { ProductFeed } from "../product-feed/product-feed";
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
    <ProductFeed>
      <div
        data-feed-stop
        className={cn(
          "relative isolate flex flex-col gap-6 overflow-hidden bg-ink px-5 py-6 md:min-h-dvh md:px-16 md:py-12",
          // A phone pages through the poster and then each photograph.
          "min-h-dvh",
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
          <ProductBackLink
            href="/#products"
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            {storefrontCopy.back}
          </ProductBackLink>
          {/* The cart sits above the founder's credit line, in the same corner,
              so a filled cart pushes the credits down instead of covering
              them. */}
          <div className="flex flex-col items-end gap-3">
            <CartCorner placement="inline" />
            {/* The founder's credit line, from the DB rather than from any
                mockup shorthand -- `products.model_credits` is the source. */}
            {product.modelCredits ? (
              // `w-fit`, so the ruler bar under the credits is as wide as the
              // longest of them, (L)/(R) included.
              <div className="flex w-fit flex-col">
                <ul className="brat flex flex-col items-end gap-1.5 text-right text-brand-red">
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
                {/* Desktop only: one ruler bar for all the models; it opens how
                  tall each is and the size they wear. */}
                <ModelFitButton
                  models={parseModelCredits(product.modelCredits).map(
                    (credit) =>
                      getModelFit(
                        product.slug,
                        credit.text.split("(")[0].trim(),
                      ),
                  )}
                  // Only where there are photographs below to look at.
                  note={
                    hasGallery
                      ? "LOOK AT GALLERY BELOW TO GET AN IDEA"
                      : undefined
                  }
                  noteHref="#gallery"
                  // Half the credits' width, flush right under them.
                  className="mt-2.5 hidden self-end md:block md:w-1/2"
                />
              </div>
            ) : null}
          </div>
        </div>

        {product.cutout ? (
          <HandoffTarget className="relative mx-auto my-auto aspect-square w-[72vw] max-w-[420px] md:w-[min(34vw,36dvh)] md:max-w-none">
            <Image
              src={product.cutout.url}
              alt={product.cutout.alt}
              fill
              priority
              sizes="(min-width: 768px) 34vw, 72vw"
              className="object-contain drop-shadow-2xl"
            />
          </HandoffTarget>
        ) : null}

        <CheckoutForm
          slug={product.slug}
          name={product.name}
          priceCents={product.priceCents}
          variants={product.variants}
          cutout={product.cutout}
          // A small arrow to the photographs below, between the title and the
          // size bars (a tap steps the phone feed).
          scrollCue={
            hasGallery ? (
              <ScrollCue
                href="#gallery"
                label="Scroll to the photographs"
                className="size-8"
              />
            ) : null
          }
        />
      </div>

      <ProductGallery images={gallery} />
    </ProductFeed>
  );
}
