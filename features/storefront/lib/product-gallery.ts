// The shoot photographs shown in the split-screen section under each product's
// poster, in reading order (left to right, then the next row). Bundled files
// rather than image slots, so a product's gallery needs a code change until the
// admin grows a place to manage them. A slug with no entry has no gallery and
// its page simply ends at the poster.
//
// Alt text stays in the register of the other lifestyle shots; the models'
// names live in `products.model_credits`, not here.
export type GalleryImage = {
  src: string;
  alt: string;
  /** CSS object-position for a photograph taller than its 4:5 frame: which part
   * of it the frame shows. Centred when left out. */
  position?: string;
};

function shots(slug: string, count: number, alt: string): GalleryImage[] {
  return Array.from({ length: count }, (_, index) => ({
    src: `/gallery/${slug}-${index + 1}.webp`,
    alt,
  }));
}

function sleepShirtShots(): GalleryImage[] {
  const framing: [number, number][] = [
    [1, 99],
    [2, 48],
    [3, 50],
    [4, 57],
    [5, 1],
    [6, 99],
    [7, 100],
    [8, 0],
    [9, 0],
    [10, 65],
    [11, 0],
  ];
  return framing.map(([number, y]) => ({
    src: `/gallery/sleep-shirt-${number}.webp`,
    alt: "Sleep Shirt lifestyle shot",
    position: `50% ${y}%`,
  }));
}

// `shots` for a gallery where some photographs are kept whole (2:3, graded from
// the camera files) in their 4:5 frames: `positions` gives, by the file's number,
// how far down the photograph the frame sits (0 = top edge, 100 = bottom edge).
// A photograph with no entry is already 4:5 and needs none.
function shotsFramed(
  slug: string,
  count: number,
  alt: string,
  positions: Record<number, number>,
): GalleryImage[] {
  return shots(slug, count, alt).map((image, index) => {
    const y = positions[index + 1];
    return y === undefined ? image : { ...image, position: `50% ${y}%` };
  });
}

const GALLERIES: Record<string, GalleryImage[]> = {
  "college-arch": shotsFramed(
    "college-arch",
    6,
    "College Arch lifestyle shot",
    {
      1: 100,
      2: 96,
      5: 49,
      6: 36,
    },
  ),
  "fc-hoodie": shots("fc-hoodie", 7, "FC Hoodie lifestyle shot"),
  "lurker-tee": shotsFramed("lurker-tee", 4, "Lurker Tee lifestyle shot", {
    1: 66,
    2: 78,
    3: 89,
    4: 26,
  }),
  "lurker-longsleeve": shotsFramed(
    "lurker-longsleeve",
    5,
    "Lurker Long Sleeve lifestyle shot",
    { 4: 50 },
  ),
  "star-shorts": shots("star-shorts", 4, "Star Shorts lifestyle shot"),
  // The Sleep Shirt photographs are kept whole (2:3), so each frame shows the
  // part the founder framed; the number is the file's, the percentage how far
  // down the photograph the 4:5 frame sits. The couch photograph (12) is a second
  // copy of the first, so it is not listed.
  "sleep-shirt": sleepShirtShots(),
};

export function getProductGallery(slug: string): GalleryImage[] {
  return GALLERIES[slug] ?? [];
}
