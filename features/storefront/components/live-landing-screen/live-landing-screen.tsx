import Image from "next/image";
import Link from "next/link";

import { CartCorner } from "@/features/cart";

import { getCatalog, getLandingImagery } from "../../lib/catalog";
import { storefrontCopy } from "../../lib/storefront-copy";
import { CatalogIndex } from "../catalog-index/catalog-index";
import { GlideLink } from "../glide-link/glide-link";
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

  return (
    // `data-snap-page` is what globals.css keys the phone's scroll snapping on.
    <main data-snap-page className="bg-ink pb-[4.5rem] md:pb-0">
      <CartCorner placement="fixed" />
      {/* Full-bleed. The image sits outside any Reveal so the LCP is never held
          behind an entrance animation, and a null hero leaves a plain ink
          screen with the same masthead on it. The scrim keeps cream type
          readable on the lighter parts of the shoot. */}
      {/* On a phone there is no hero: the visitor lands straight on the first
          product, one garment to a screen (see CatalogIndex), and every swipe
          snaps the next one into focus. The hero is the widescreen, full-height
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
      <div className="flex min-h-dvh snap-start items-center justify-center bg-ink px-5 md:min-h-0 md:[scroll-snap-align:none] md:items-start md:pb-[88px]">
        <Link
          href="/world"
          className="font-display text-4xl tracking-[0.05em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
        >
          WORLD
        </Link>
      </div>

      <div className="snap-end md:[scroll-snap-align:none]">
        <SiteFooter />
      </div>
    </main>
  );
}
