import Image from "next/image";

import { CartCorner } from "@/features/cart";
import {
  CheckoutForm,
  PairCutout,
  PairViewProvider,
} from "@/features/checkout";
import { HandoffTarget, ProductBackLink } from "@/features/transition";
import { cn } from "@/lib/utils";

import type { ProductDetail } from "../../lib/catalog";
import { parseModelCredits } from "../../lib/model-credits";
import { getModelFit } from "../../lib/model-fit";
import { getScrim } from "../../lib/background-scrim";
import {
  getBackgroundPositionClass,
  getPageExposureClass,
  getPageScaleClass,
} from "../../lib/cutout-treatment";
import { getDesignImages } from "../../lib/design-images";
import { getProductGallery } from "../../lib/product-gallery";
import { getProductSpecs } from "../../lib/product-specs";
import type { ProductNeighbors } from "../../lib/product-neighbors";
import { storefrontCopy } from "../../lib/storefront-copy";
import { ModelFitButton } from "../model-fit/model-fit-button";
import { ProductFeed } from "../product-feed/product-feed";
import { ProductNeighborArrows } from "../product-neighbor-arrows/product-neighbor-arrows";
import { ProductGallery } from "../product-gallery/product-gallery";
import { ScrollCue } from "../scroll-cue/scroll-cue";

// The founder's order poster: the shoot full-bleed, the garment's cutout dead
// centre, red Anton set straight onto the photograph. BACK and the model
// credits sit across the top; size, delivery and place order are stacked,
// centred, along the bottom (CheckoutForm). All of it is one type size.
export function ProductScreen({
  product,
  neighbors,
}: {
  product: ProductDetail;
  neighbors: ProductNeighbors;
}) {
  const gallery = getProductGallery(product.slug);
  const hasGallery = gallery.length > 0;

  return (
    <PairViewProvider>
      <ProductFeed neighbors={neighbors}>
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
                className={cn(
                  "-z-20 object-cover",
                  getBackgroundPositionClass(product.slug),
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 -z-10",
                  getScrim(product.slug, product.background.url).wash,
                )}
              />
              {/* A deeper wash behind the order controls at the foot, where the
                red type sits over whatever the photograph has there. */}
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t to-transparent",
                  getScrim(product.slug, product.background.url).foot,
                )}
              />
            </>
          ) : null}

          <ProductNeighborArrows neighbors={neighbors} />

          <div className="flex items-start justify-between gap-4">
            <ProductBackLink
              href="/#products"
              className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
            >
              {storefrontCopy.back}
            </ProductBackLink>
            <div className="flex flex-col items-end gap-3">
              {/* The founder's credit line, from the DB rather than from any
                mockup shorthand -- `products.model_credits` is the source. */}
              {product.modelCredits ? (
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
                    specs={getProductSpecs(product.slug)}
                    // Only where there are photographs below to look at.
                    note={
                      hasGallery
                        ? "LOOK AT GALLERY BELOW TO GET AN IDEA"
                        : undefined
                    }
                    noteHref="#gallery"
                    // One size for every product: the FC hoodie's, which is half
                    // the width of its widest credit. That is 1.458 times the
                    // credits' type size (see `brat`, whose clamp this repeats),
                    // so it follows the window the way the credits do.
                    className="mt-2.5 hidden self-end md:block md:w-[calc(clamp(1.75rem,3.6vw,3rem)*1.458)]"
                  />
                </div>
              ) : null}
              {/* The cart floats under the credits and the specs bar and takes no
                room, so a filled cart never pushes the page's text and pictures
                down. Its layer sits below the specs panel, which opens over it. */}
              <div className="relative -mb-3 h-0 w-full">
                <div className="absolute top-0 right-0 z-[5] w-max max-w-[calc(100vw-2.5rem)]">
                  <CartCorner placement="inline" />
                </div>
              </div>
            </div>
          </div>

          {product.cutout ? (
            <HandoffTarget className="relative mx-auto my-auto aspect-square w-[72vw] max-w-[420px] md:w-[min(34vw,36dvh)] md:max-w-none">
              <PairCutout
                designImages={getDesignImages(product.slug)}
                url={product.cutout.url}
                alt={product.cutout.alt}
                sizes="(min-width: 768px) 34vw, 72vw"
                className={cn(
                  "object-contain drop-shadow-2xl",
                  getPageExposureClass(product.slug),
                  getPageScaleClass(product.slug),
                )}
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
    </PairViewProvider>
  );
}
