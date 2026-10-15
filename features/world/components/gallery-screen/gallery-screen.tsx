import Link from "next/link";

import { SiteFooter, storefrontCopy } from "@/features/storefront";

import { GalleryGrid } from "../gallery-grid/gallery-grid";
import { worldGallery } from "../../lib/world-gallery";

// Every shoot photograph, by shoot, four across on a desktop (two on a phone).
export function GalleryScreen() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex h-16 shrink-0 items-center px-5 md:px-10">
        <Link
          href="/"
          className="font-display text-[15px] tracking-[0.05em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:text-[17px]"
        >
          {storefrontCopy.wordmark}
        </Link>
      </header>

      <section className="px-5 pt-8 pb-16 md:px-10">
        <h1 className="mb-8 text-center font-display text-6xl leading-none tracking-[0.03em] text-cream uppercase">
          GALLERY
        </h1>
        <GalleryGrid sections={worldGallery} />
      </section>

      <SiteFooter />
    </main>
  );
}
