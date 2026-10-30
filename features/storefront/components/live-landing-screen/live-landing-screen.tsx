import Image from "next/image";
import Link from "next/link";

import { CartCorner } from "@/features/cart";
import { ProductOverlay } from "@/features/transition";

import { getCatalog, getLandingImagery, getProduct } from "../../lib/catalog";
import { storefrontCopy } from "../../lib/storefront-copy";
import { CatalogIndex } from "../catalog-index/catalog-index";
import { FeedPager } from "../feed-pager/feed-pager";
import { GlideLink } from "../glide-link/glide-link";
import { ProductScreen } from "../product-screen/product-screen";
import { Reveal } from "../reveal/reveal";
import { ScrollCue } from "../scroll-cue/scroll-cue";
import { SiteFooter } from "../site-footer/site-footer";

// Direction A ("Feature Presentation"), picked by Zach 2026-09-08: the store as
// an A24 film page. The first screen is the photograph edge to edge and the
// full height of the window, with the masthead laid over it: the red wordmark
// edge to edge at the top, the mascot centred, the byline at the foot. The issue line is gone at
// the founder's request. The catalog waits below, then the footer.
// Red at rest; the brand yellow for all three at once as soon as any one of
// them is under a pointer or has keyboard focus. The group is the overlay
// that holds them, and `has-` asks it whether one of its links is hovered, so
// pointing at the empty photo between them changes nothing.
const hoverYellow =
  "text-brand-red transition-colors duration-200 group-has-[a:hover]/front:text-brand-yellow group-has-[a:focus-visible]/front:text-brand-yellow focus-visible:outline-none";

// Next's image optimiser URL for a remote file, same-origin to the page.
function optimizedUrl(url: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}

export async function LiveLandingScreen() {
  const [products, imagery] = await Promise.all([
    getCatalog(),
    getLandingImagery(),
  ]);

  // Every product page rides along so a phone can open one in place with
  // nothing left to fetch (see ProductOverlay).
  const details = await Promise.all(
    products.map((product) => getProduct(product.slug)),
  );
  const panels = details.flatMap((detail) =>
    detail
      ? [{ slug: detail.slug, node: <ProductScreen product={detail} /> }]
      : [],
  );

  return (
    <main className="group/landing bg-ink max-md:fixed max-md:inset-0 max-md:overflow-hidden max-md:data-[view=grid]:overflow-y-auto">
      <FeedPager count={products.length} />
      <CartCorner placement="fixed" />
      <ProductOverlay panels={panels} />
      {/* The phone's all-products grid sits on a photograph, fixed behind the
          scrolling tiles under a scrim so the red type reads. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 hidden max-md:group-data-[view=grid]/landing:block"
      >
        <Image
          src="/world/grid-background.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/65" />
      </div>
      {/* On a phone <main> is pinned to the screen and this track is slid up
          and down by the FeedPager, so the page itself never scrolls. */}
      <div data-feed-track className="max-md:pb-[4.5rem]">
        {/* Full-bleed. The image sits outside any Reveal so the LCP is never held
          behind an entrance animation, and a null hero leaves a plain ink
          screen with the same masthead on it. The scrim keeps cream type
          readable on the lighter parts of the shoot. */}
        {/* On a phone there is no hero: the visitor lands straight on the first
          product, one garment to a screen (see CatalogIndex), and every swipe
          swipes the next one into focus. The hero is the widescreen, full-height
          opening from md up, with a small arrow instead. */}
        <section className="relative hidden h-dvh w-full overflow-hidden bg-ink md:block">
          {imagery.hero && (
            <Image
              src={imagery.hero.url}
              alt={imagery.hero.alt}
              fill
              sizes="100vw"
              className="hidden object-cover md:block"
            />
          )}
          <div className="absolute inset-0 bg-ink/35" />
          <ScrollCue
            href="#products"
            label="Scroll to the products"
            className="absolute bottom-[calc(10dvh+2.5rem)] left-1/2 -translate-x-1/2"
          />
          <Reveal className="group/front relative flex h-full w-full flex-col items-center justify-between pt-[4dvh] pb-[calc(4dvh+2.5rem)]">
            {/* Red, and as wide as the window allows: 14vw of Anton runs the
              fourteen characters edge to edge with a sliver of margin. It sits
              where the star used to, at the top of the frame. The three
              pieces of front-of-house are each a link to the grid and go
              yellow together; a click lands on the products. */}
            <h1 className="w-full text-center font-display text-[14vw] leading-none whitespace-nowrap">
              <GlideLink href="#products" className={hoverYellow}>
                {storefrontCopy.wordmark}
              </GlideLink>
            </h1>
            {/* Goblin line-art is a founder upload (landing_mascot, P4). Until
              it exists the slot stays honestly empty -- never faked. It is the
              upload used as a mask over a filled box, so "yellow" is the brand
              token recolouring the drawing rather than a filter guessing at it;
              the image goes through Next's own optimiser URL so the mask loads
              same-origin (a mask from another origin needs CORS headers). */}
            {imagery.mascot && (
              <GlideLink
                href="#products"
                role="img"
                aria-label={imagery.mascot.alt || "Shop the products"}
                className={`block aspect-square w-[34vw] max-w-52 ${hoverYellow}`}
              >
                <span
                  aria-hidden
                  className="block size-full bg-current"
                  style={{
                    maskImage: `url(${optimizedUrl(imagery.mascot.url, 640)})`,
                    WebkitMaskImage: `url(${optimizedUrl(imagery.mascot.url, 640)})`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
              </GlideLink>
            )}
            <p className="font-body text-[16.5px] font-semibold tracking-[0.4em] md:text-lg">
              <GlideLink href="#products" className={hoverYellow}>
                {storefrontCopy.byline}
              </GlideLink>
            </p>
          </Reveal>
        </section>

        <CatalogIndex products={products} />

        {/* One red link under the grid: WORLD holds the gallery, cinema, radio
          and the get-involved forms. */}
        <div
          data-feed-stop
          data-feed-world
          className="flex min-h-dvh items-center justify-center bg-ink max-md:group-data-[view=grid]/landing:bg-transparent px-5 max-md:group-data-[view=grid]/landing:min-h-0 max-md:group-data-[view=grid]/landing:py-12 md:min-h-0 md:items-start md:pb-[88px]"
        >
          <Link
            href="/world"
            className="group/world flex flex-col items-center gap-2 font-display text-4xl tracking-[0.05em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            WORLD
            {/* A small globe under the word, tilted like the real one; it takes
                the link's colour and spins while the link is pointed at. */}
            <span className="block -rotate-[23deg]">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="size-7 motion-safe:group-hover/world:animate-[spin_2.5s_linear_infinite] motion-safe:group-focus-visible/world:animate-[spin_2.5s_linear_infinite]"
              >
                <circle cx="12" cy="12" r="9.5" />
                <ellipse cx="12" cy="12" rx="4" ry="9.5" />
                <path d="M2.5 12h19M4 7h16M4 17h16" />
              </svg>
            </span>
          </Link>
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
