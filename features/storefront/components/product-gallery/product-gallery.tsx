"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { PhotoLightbox } from "@/features/photo-lightbox";

import type { GalleryImage } from "../../lib/product-gallery";

// The scrolled-down half of a product page: the shoot, two across from md up,
// full-bleed with every frame touching so each photograph runs half the window
// wide. An odd last image would leave an empty half, so it takes a full-width
// band of its own (cropped wide, weighted toward the people). On desktop each
// frame opens the same zoomed view as the world gallery; on a phone the
// photographs are only to look at, one to a screen of the page's feed.
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    // Back to the thumbnail that opened it, so keyboard users keep their place.
    opener.current?.focus();
  }, []);

  if (images.length === 0) return null;

  return (
    <section id="gallery" aria-label="Photographs" className="bg-ink">
      {/* A phone gets one photograph to a screen, each a stop in the product
          page's feed. On desktop the hovered frame grows a little over its
          neighbours (they touch, so it sits above them) to say it can be opened. */}
      <ul className="grid grid-cols-1 overflow-x-clip md:grid-cols-2">
        {images.map((image, index) => {
          const isOrphan =
            images.length % 2 === 1 && index === images.length - 1;
          return (
            <li
              key={image.src}
              data-feed-stop
              className={
                isOrphan
                  ? "relative h-dvh md:col-span-2 md:aspect-video md:h-auto md:focus-within:z-10 md:hover:z-10"
                  : "relative h-dvh md:aspect-4/5 md:h-auto md:focus-within:z-10 md:hover:z-10"
              }
            >
              <button
                type="button"
                onClick={(event) => {
                  // Not on a phone: there the photographs are not clickable.
                  if (!window.matchMedia("(min-width: 768px)").matches) return;
                  opener.current = event.currentTarget;
                  setOpenIndex(index);
                }}
                aria-label={`View photograph ${index + 1} of ${images.length}`}
                className="absolute inset-0 max-md:pointer-events-none md:cursor-zoom-in md:transition-transform md:duration-300 md:hover:scale-105 md:hover:shadow-2xl md:hover:shadow-ink/60 md:focus-visible:scale-105 md:focus-visible:outline-2 md:focus-visible:-outline-offset-2 md:focus-visible:outline-brand-yellow"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={isOrphan ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
                  className={
                    isOrphan ? "object-cover object-[50%_38%]" : "object-cover"
                  }
                />
              </button>
            </li>
          );
        })}
      </ul>
      <PhotoLightbox
        images={images}
        openIndex={openIndex}
        onIndexChange={setOpenIndex}
        onClose={close}
      />
    </section>
  );
}
