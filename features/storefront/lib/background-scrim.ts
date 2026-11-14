// The ink wash over a product's background photograph, and the deeper one behind
// the order controls at its foot. Literal class names, so Tailwind can see them.
type Scrim = { wash: string; foot: string };

const STANDARD: Scrim = {
  wash: "bg-ink/40",
  foot: "from-ink/70",
};

// The FC hoodie shoot is dark to begin with, so the standard wash buries it. The
// lighter wash belongs to that photograph, not to the product: it applies only
// while the background is still the one seeded for it (`product_bg-fc-hoodie`).
// The admin uploader stores a replacement under a new path, so the day the
// founder swaps the photo this stops matching and the standard wash is back.
const LIGHTER: Scrim = {
  wash: "bg-ink/10",
  foot: "from-ink/45",
};
const LIGHTER_FOR: { slug: string; file: string } = {
  slug: "fc-hoodie",
  file: "product_bg-fc-hoodie.webp",
};

export function getScrim(slug: string, backgroundUrl: string): Scrim {
  return slug === LIGHTER_FOR.slug && backgroundUrl.includes(LIGHTER_FOR.file)
    ? LIGHTER
    : STANDARD;
}
