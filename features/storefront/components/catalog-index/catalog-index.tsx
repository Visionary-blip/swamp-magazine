import Image from "next/image";

import { HandoffLink } from "@/features/transition";
import { formatUsd } from "@/lib/money";

import type { CatalogProduct } from "../../lib/catalog";
import { getProductGallery } from "../../lib/product-gallery";
import { Reveal } from "../reveal/reveal";

// The product grid under the hero (one row of four from md up, two across on a
// phone): each garment's cutout on ink, name and price
// beneath, the whole tile the link. It replaces the film-credits index list at
// the founder's request -- the visitor scrolls past the photograph and meets the
// clothes themselves. A product with no cutout uploaded yet still gets a tile
// (name and price on an empty square) rather than vanishing from the shop.
export function CatalogIndex({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section
      id="products"
      className="bg-ink max-md:group-data-[view=grid]/landing:bg-transparent max-md:group-data-[view=grid]/landing:px-2 max-md:group-data-[view=grid]/landing:pt-14 md:px-16 md:py-[88px]"
    >
      {/* A phone gets one garment per screen, each a stop in the FeedPager: a
          swipe lands on the next one. From md up it is the four-across grid. */}
      <ul className="grid grid-cols-1 max-md:group-data-[view=grid]/landing:grid-cols-2 max-md:group-data-[view=grid]/landing:gap-y-4 md:grid-cols-4 md:gap-x-8 md:gap-y-16">
        {products.map((product, index) => {
          // The shoot's first portrait frame suits a portrait screen far better
          // than cropping the landscape poster background down to a strip; the
          // poster background is the fallback for a product with no gallery.
          const backdrop =
            getProductGallery(product.slug)[0]?.src ?? product.background?.url;
          return (
            <li
              key={product.slug}
              // A stop for the phone's FeedPager: one swipe, one product.
              data-feed-stop
              data-feed-product
              className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-5 max-md:group-data-[view=grid]/landing:min-h-0 max-md:group-data-[view=grid]/landing:items-start max-md:group-data-[view=grid]/landing:px-0 md:min-h-0 md:items-start md:overflow-visible md:px-0"
            >
              {/* Phone only: the product page's own shoot as a full-screen
                vertical backdrop, cropped to the portrait screen, under a
                scrim so the red type reads. A product with no shoot is plain
                ink. */}
              {backdrop ? (
                <>
                  <Image
                    src={backdrop}
                    alt=""
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="-z-20 object-cover max-md:group-data-[view=grid]/landing:hidden md:hidden"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-linear-to-b from-ink/30 via-ink/20 to-ink/70 max-md:group-data-[view=grid]/landing:hidden md:hidden"
                  />
                </>
              ) : null}
              {/* Full width, or the flex <li> shrinks it to its title and every
                tile's square comes out a different size, which is what staggers
                the titles down the grid. */}
              <Reveal delay={index * 0.06} className="w-full">
                <HandoffLink
                  href={`/product/${product.slug}`}
                  overlaySlug={product.slug}
                  className="group flex w-full flex-col items-center gap-4 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
                >
                  <div
                    data-handoff
                    className="relative aspect-square w-full max-md:w-[78%] max-md:group-data-[view=grid]/landing:w-full"
                  >
                    {product.cutout ? (
                      <Image
                        src={product.cutout.url}
                        alt={product.cutout.alt || product.name}
                        fill
                        sizes="(min-width: 768px) 22vw, 90vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <span className="font-display text-2xl leading-none tracking-[0.02em] text-brand-red uppercase transition-colors duration-200 group-hover:text-brand-yellow max-md:group-data-[view=grid]/landing:text-lg md:text-2xl lg:text-[30px]">
                    {product.name}
                  </span>
                  <span className="font-display text-lg text-cream/70 md:text-xl">
                    {formatUsd(product.priceCents)}
                  </span>
                </HandoffLink>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
