import { MastheadLink, SiteFooter } from "@/features/storefront";

import { GalleryGrid } from "../gallery-grid/gallery-grid";
import { worldGallery } from "../../lib/world-gallery";

// Every shoot photograph, by shoot, four across on a desktop (two on a phone), full-bleed with the frames touching.
export function GalleryScreen() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex min-h-16 shrink-0 items-center px-5 py-2 md:px-10">
        <MastheadLink backToWorld />
      </header>

      <section className="pt-8 pb-16">
        <h1 className="mb-8 px-5 text-center font-display text-6xl leading-none tracking-[0.03em] text-cream uppercase">
          GALLERY
        </h1>
        <GalleryGrid sections={worldGallery} />
      </section>

      <SiteFooter />
    </main>
  );
}
