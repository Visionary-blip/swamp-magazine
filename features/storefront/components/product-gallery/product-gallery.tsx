import Image from "next/image";

import type { GalleryImage } from "../../lib/product-gallery";

// The scrolled-down half of a product page: the shoot, two across from md up,
// full-bleed with every frame touching so each photograph runs half the window
// wide. An odd last image would leave an empty half, so it takes a full-width
// band of its own (cropped wide, weighted toward the people). The photographs
// are only to look at -- nothing here opens or zooms them.
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <section id="gallery" aria-label="Photographs" className="bg-ink">
      {/* A phone gets one photograph to a screen, each a stop in the product
          page's feed. */}
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
                  ? "relative h-dvh md:col-span-2 md:aspect-video md:h-auto"
                  : "relative h-dvh md:aspect-4/5 md:h-auto"
              }
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
            </li>
          );
        })}
      </ul>
    </section>
  );
}
