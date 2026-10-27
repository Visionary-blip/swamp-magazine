"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

const arrowClasses =
  "absolute top-1/2 z-10 -translate-y-1/2 px-4 py-6 font-display text-5xl leading-none text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:px-8 md:text-6xl";

export type LightboxImage = { src: string; alt: string };

// The zoomed photograph over the page, shared by the world gallery and each
// product's gallery. The caller owns which index is open (null = closed) and
// where focus returns on close; this owns the keys, the scroll lock and the
// controls. The arrows wrap around the list.
export function PhotoLightbox({
  images,
  openIndex,
  onIndexChange,
  onClose,
}: {
  images: readonly LightboxImage[];
  openIndex: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const step = useCallback(
    (direction: 1 | -1) => {
      if (openIndex === null) return;
      onIndexChange((openIndex + direction + count) % count);
    },
    [openIndex, count, onIndexChange],
  );

  const isOpen = openIndex !== null;
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "Escape") onClose();
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
  }, [isOpen, step, onClose]);

  const current = openIndex === null ? null : images[openIndex];
  if (!current || openIndex === null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${openIndex + 1} of ${count}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95"
      // A click on the backdrop closes; clicks on the controls or photo do
      // not reach it.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
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
        onClick={onClose}
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
  );
}
