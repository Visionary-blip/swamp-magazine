// Per-product adjustments to how a cutout is drawn, for the few photographs that
// do not sit like the rest. Literal class names, so Tailwind can see them.

// A cutout that is as big as its neighbours' in its box can still read smaller
// (a dark hoodie's silhouette against the ink ground, say). `scale` draws it a
// size up on the grid tile, and `hover` is that size plus the usual hover growth.
const GRID_SCALE: Record<string, string> = {
  "fc-hoodie": "origin-bottom scale-[1.18] group-hover:scale-[1.24]",
  // These two fill the tile's width like the rest but are shorter in it, so
  // they read a size down beside the tees. They grow from the centre, not the
  // bottom: the tees' shapes are centred in their tiles, and growing from the
  // bottom lifts a shirt above its neighbours.
  "triple-croc-tee": "scale-[1.1] group-hover:scale-[1.16]",
  "sleep-shirt": "scale-[1.06] group-hover:scale-[1.12]",
};

export function getGridScaleClass(slug: string): string {
  return GRID_SCALE[slug] ?? "group-hover:scale-105";
}

// A photograph that needs lifting on its own page (the grid shows it as shot) goes
// here, e.g. `brightness-[1.9] saturate-[0.4]` for the first, near-black FC hoodie
// photo. The newer hoodie photo is lit well enough to need none.
const PAGE_EXPOSURE: Record<string, string> = {};

export function getPageExposureClass(slug: string): string {
  return PAGE_EXPOSURE[slug] ?? "";
}

// The same, for a cutout that reads small on its own page: drawn a size up inside
// the box the other products fill. The box itself stays put, so the hand-off from
// the grid lands where it always does.
const PAGE_SCALE: Record<string, string> = {
  "fc-hoodie": "scale-[1.15]",
};

export function getPageScaleClass(slug: string): string {
  return PAGE_SCALE[slug] ?? "";
}

// Where a product's background photograph sits in its frame. The poster is wide
// and most shoots are tall, so the frame shows a band of the photo: a lower
// percentage slides the photo down (more of its top in view). Centred unless
// listed.
const BACKGROUND_POSITION: Record<string, string> = {
  "sleep-shirt": "object-[50%_45%]",
};

export function getBackgroundPositionClass(slug: string): string {
  return BACKGROUND_POSITION[slug] ?? "";
}
