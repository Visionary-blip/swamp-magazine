// The shoot photographs shown in the split-screen section under each product's
// poster, in reading order (left to right, then the next row). Bundled files
// rather than image slots, so a product's gallery needs a code change until the
// admin grows a place to manage them. A slug with no entry has no gallery and
// its page simply ends at the poster.
//
// Alt text stays in the register of the other lifestyle shots; the models'
// names live in `products.model_credits`, not here.
export type GalleryImage = { src: string; alt: string };

function shots(slug: string, count: number, alt: string): GalleryImage[] {
  return Array.from({ length: count }, (_, index) => ({
    src: `/gallery/${slug}-${index + 1}.webp`,
    alt,
  }));
}

// The same files in an order of their own: the numbers are the files' names, so
// a new photograph can take a place in the run without renaming the rest.
function shotsInOrder(
  slug: string,
  order: number[],
  alt: string,
): GalleryImage[] {
  return order.map((number) => ({
    src: `/gallery/${slug}-${number}.webp`,
    alt,
  }));
}

const GALLERIES: Record<string, GalleryImage[]> = {
  "college-arch": shots("college-arch", 6, "College Arch lifestyle shot"),
  "fc-hoodie": shots("fc-hoodie", 5, "FC Hoodie lifestyle shot"),
  "lurker-tee": shots("lurker-tee", 4, "Lurker Tee lifestyle shot"),
  "lurker-longsleeve": shots(
    "lurker-longsleeve",
    5,
    "Lurker Long Sleeve lifestyle shot",
  ),
  "star-shorts": shots("star-shorts", 4, "Star Shorts lifestyle shot"),
  // The couch photograph (12) sits third, behind the two that lead.
  "sleep-shirt": shotsInOrder(
    "sleep-shirt",
    [1, 2, 12, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "Sleep Shirt lifestyle shot",
  ),
};

export function getProductGallery(slug: string): GalleryImage[] {
  return GALLERIES[slug] ?? [];
}
