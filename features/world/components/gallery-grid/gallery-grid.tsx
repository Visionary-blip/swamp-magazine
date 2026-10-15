"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { WorldGallerySection } from "../../lib/world-gallery";

const arrowClasses =
  "absolute top-1/2 z-10 -translate-y-1/2 px-4 py-6 font-display text-5xl leading-none text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:px-8 md:text-6xl";

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
  const closeButton = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const step = useCallback(
    (direction: 1 | -1) =>
      setOpenIndex((current) =>
        current === null ? null : (current + direction + count) % count,
      ),
    [count],
  );
  const close = useCallback(() => {
    setOpenIndex(null);
    // Back to the thumbnail that opened it, so keyboard users keep their place.
    opener.current?.focus();
  }, []);

  const isOpen = openIndex !== null;
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);

    // The page behind must not scroll under the overlay.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, step, close]);

  // Where each section's first photo sits in the flattened list.
  const starts = sections.map((_, index) =>
    sections
      .slice(0, index)
      .reduce((total, section) => total + section.images.length, 0),
  );
  const current = openIndex === null ? null : images[openIndex];

  return (
    <>
      {sections.map((section, sectionIndex) => {
        const start = starts[sectionIndex];
        return (
          <div key={section.heading} className="mt-12 first:mt-0">
            <h2 className="mb-6 text-center font-display text-4xl leading-none tracking-[0.03em] text-brand-red uppercase">
              {section.heading}
            </h2>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {section.images.map((image, index) => (
                <li key={image.src} className="relative aspect-[4/5]">
                  <button
                    type="button"
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setOpenIndex(start + index);
                    }}
                    aria-label={`View photograph ${start + index + 1} of ${count}`}
                    className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
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

      {current && openIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph ${openIndex + 1} of ${count}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95"
          // A click on the backdrop closes; clicks on the controls or photo do
          // not reach it.
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button
            ref={closeButton}
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 px-4 py-2 font-display text-6xl leading-none text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photograph"
            className={`${arrowClasses} left-0`}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photograph"
            className={`${arrowClasses} right-0`}
          >
            ›
          </button>
          <div
            className="relative h-[88dvh] w-[calc(100%-7rem)] md:w-[calc(100%-12rem)]"
            onClick={close}
          >
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
