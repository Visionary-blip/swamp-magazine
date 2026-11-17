// Where a tile sits off its grid cell when the product grid is "scattered"
// (`dials.scatterProducts`), after the floating grid on skylrk.com: every tile
// keeps its cell but is nudged by its own offset and, now and then, drawn a touch
// smaller. Skylrk's offsets are fixed per product, not drawn on each visit, and
// so are these: seeded by the slug, so the server and the browser agree (no
// hydration mismatch), a product keeps its place when another is added, and the
// layout is the same for everyone.
export type Scatter = {
  /** Horizontal nudge, percent of the tile's own width. */
  x: number;
  /** Vertical nudge, percent of the tile's own height. */
  y: number;
  scale: number;
};

// mulberry32 over a string hash: small, and the same everywhere.
function seeded(slug: string): () => number {
  let hash = 1779033703;
  for (let i = 0; i < slug.length; i += 1) {
    hash = Math.imul(hash ^ slug.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Changing this reshuffles every tile; chosen so that no two tiles overlap at the
// common desktop widths (checked by measuring the rendered boxes).
const SALT = "v";

export function getScatter(slug: string): Scatter {
  const next = seeded(`${SALT}:${slug}`);
  return {
    x: Math.round(-24 + next() * 48),
    y: Math.round(-32 + next() * 62),
    // Some drawn well under full size, so the field is uneven in size as well as
    // in place (and the smaller ones leave room for their neighbours to drift).
    scale: Math.round((0.78 + next() * 0.22) * 100) / 100,
  };
}
