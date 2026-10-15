import Image from "next/image";
import Link from "next/link";

import { formatUsd } from "@/lib/money";

import type { CatalogProduct } from "../../lib/catalog";
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
    <section id="products" className="bg-ink px-5 py-16 md:px-16 md:py-[88px]">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8 md:gap-y-16">
        {products.map((product, index) => (
          <li key={product.slug}>
            <Reveal delay={index * 0.06}>
              <Link
                href={`/product/${product.slug}`}
                className="group flex flex-col items-center gap-4 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
              >
                <div className="relative aspect-square w-full">
                  {product.cutout ? (
                    <Image
                      src={product.cutout.url}
                      alt={product.cutout.alt || product.name}
                      fill
                      sizes="(min-width: 768px) 22vw, 46vw"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <span className="font-display text-2xl leading-none tracking-[0.02em] text-brand-red uppercase transition-colors duration-200 group-hover:text-brand-yellow md:text-2xl lg:text-[30px]">
                  {product.name}
                </span>
                <span className="font-display text-lg text-cream/70 md:text-xl">
                  {formatUsd(product.priceCents)}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
