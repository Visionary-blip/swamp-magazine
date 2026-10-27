"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { PhotoLightbox } from "@/features/photo-lightbox";

import type { WorldGallerySection } from "../../lib/world-gallery";

// The grid and its lightbox in one client component: the open photo is a single
// index into the flattened list, so the arrows run on across the section
// boundary instead of stopping at DREGS' last picture.
export function GalleryGrid({
  sections,
}: {
  sections: readonly WorldGallerySection[];
}) {
  const images = sections.flatMap((section) => section.images);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const count = images.length;
  const close = useCallback(() => {
    setOpenIndex(null);
    // Back to the thumbnail that opened it, so keyboard users keep their place.
    opener.current?.focus();
  }, []);
  // Where each section's first photo sits in the flattened list.
  const starts = sections.map((_, index) =>
    sections
      .slice(0, index)
      .reduce((total, section) => total + section.images.length, 0),
  );

  return (
    <>
      {sections.map((section, sectionIndex) => {
        const start = starts[sectionIndex];
        return (
          <div key={section.heading} className="mt-12 first:mt-0">
            <h2 className="mb-6 px-5 text-center font-display text-4xl leading-none tracking-[0.03em] text-brand-red uppercase">
              {section.heading}
            </h2>
            <ul className="grid grid-cols-2 overflow-x-clip md:grid-cols-4">
              {section.images.map((image, index) => (
                <li
                  key={image.src}
                  className="relative aspect-[4/5] hover:z-10 focus-within:z-10"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setOpenIndex(start + index);
                    }}
                    aria-label={`View photograph ${start + index + 1} of ${count}`}
                    className="absolute inset-0 cursor-zoom-in transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-ink/60 focus-visible:scale-105 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-yellow"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      priority={sectionIndex === 0 && index < 4}
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <PhotoLightbox
        images={images}
        openIndex={openIndex}
        onIndexChange={setOpenIndex}
        onClose={close}
      />
    </>
  );
}
