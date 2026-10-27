"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { PhotoLightbox } from "@/features/photo-lightbox";

import type { GalleryImage } from "../../lib/product-gallery";

// The scrolled-down half of a product page (hidden on a phone): the shoot, two across on every
// screen, full-bleed with every frame touching so each photograph runs half the
// window wide. An odd last image would leave an empty half, so it takes a
// full-width band of its own (cropped wide, weighted toward the people). Each
// frame opens the same zoomed view as the world gallery.
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
    <section
      id="gallery"
      aria-label="Photographs"
      // Desktop only: a phone gets the poster and its order bars, nothing below.
      className="bg-ink max-md:hidden"
    >
      {/* The hovered frame grows a little over its neighbours (they touch, so it
          sits above them) to say it can be opened. */}
      <ul className="grid grid-cols-2 overflow-x-clip">
        {images.map((image, index) => {
          const isOrphan =
            images.length % 2 === 1 && index === images.length - 1;
          return (
            <li
              key={image.src}
              className={
                isOrphan
                  ? "relative col-span-2 aspect-4/3 hover:z-10 focus-within:z-10 md:aspect-video"
                  : "relative aspect-4/5 hover:z-10 focus-within:z-10"
              }
            >
              <button
                type="button"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setOpenIndex(index);
                }}
                aria-label={`View photograph ${index + 1} of ${images.length}`}
                className="absolute inset-0 cursor-zoom-in transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-ink/60 focus-visible:scale-105 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={isOrphan ? "100vw" : "50vw"}
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
