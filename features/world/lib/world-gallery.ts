// The shoot photographs on the WORLD gallery, grouped under the founder's
// headings, in reading order. Bundled files, like the product galleries, so
// adding one is a code change. Alt text stays generic: credits live with the
// products.
export type WorldGallerySection = {
  heading: string;
  images: readonly { src: string; alt: string }[];
};

function shots(from: number, to: number): { src: string; alt: string }[] {
  return Array.from({ length: to - from + 1 }, (_, index) => ({
    src: `/world/gallery-${from + index}.webp`,
    alt: "Swamp Magazine shoot photograph",
  }));
}

export const worldGallery: readonly WorldGallerySection[] = [
  // The pile-of-clothes shoot.
  { heading: "DREGS", images: shots(1, 10) },
  // The pink-and-maroon shirt shoot, then the stoop and couch shoot.
  { heading: "THE STANDARD ISSUE", images: shots(11, 27) },
];
