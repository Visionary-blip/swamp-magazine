import Image from "next/image";

import type { GalleryImage } from "../../lib/product-gallery";

// The scrolled-down half of a product page: the shoot, two portraits side by
// side edge to edge, no gutter between them -- a split screen. Two columns on a
// phone too, because the split is the point; each frame just gets narrower. An
// odd last image would leave an empty half, so it takes a full-width band of
// its own (cropped wide, weighted toward the people) rather than sitting beside
// nothing.
export function ProductGallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;
  const hasOrphan = images.length % 2 === 1;

  return (
    <section
      id="gallery"
      aria-label="Photographs"
      className="grid grid-cols-2 bg-ink"
    >
      {images.map((image, index) => {
        const isOrphan = hasOrphan && index === images.length - 1;
        return (
          <div
            key={image.src}
            className={
              isOrphan
                ? "relative col-span-2 aspect-4/3 md:aspect-video"
                : "relative aspect-4/5"
            }
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
          </div>
        );
      })}
    </section>
  );
}
