// Per-product adjustments to how a cutout is drawn, for the few photographs that
// do not sit like the rest. Literal class names, so Tailwind can see them.

// A cutout that is as big as its neighbours' in its box can still read smaller
// (a dark hoodie's silhouette against the ink ground, say). `scale` draws it a
// size up on the grid tile, and `hover` is that size plus the usual hover growth.
const GRID_SCALE: Record<string, string> = {
  "fc-hoodie": "origin-bottom scale-[1.18] group-hover:scale-[1.24]",
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
