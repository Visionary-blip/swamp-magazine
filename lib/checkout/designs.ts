// A garment that comes in more than one design (the Sleep Shirt: EX-MODEL,
// SWEET DREAMS, or two of them). The design is not a variant in the database --
// stock is per size -- so it rides in the order line's size text ("L / SWEET
// DREAMS"), like Botched does, and shows on the order, the admin list and the
// emails with no new column. Two shirts are one line, each with a design and a
// size of its own, written "L / EX-MODEL + XL / SWEET DREAMS"; that line is
// bought two at a time. (The older "L / EX-MODEL + SWEET DREAMS", one size for
// both, still reads.)

export const DESIGN_SEPARATOR = " / ";

const DESIGNS: Record<string, readonly string[]> = {
  "sleep-shirt": ["EX-MODEL", "SWEET DREAMS"],
};

export const PAIR_SEPARATOR = " + ";

export type Shirt = { size: string; design: string | null };

// The sizes a designed garment is cut in, when that is fewer than the database
// holds. The server holds the line to them as well as the page.
const OFFERED_SIZES: Record<string, readonly string[]> = {
  "sleep-shirt": ["L", "XL"],
};

/** The sizes a garment is offered in, or null when it is every size it has. */
export function offeredSizes(slug: string): readonly string[] | null {
  return OFFERED_SIZES[slug] ?? null;
}

// A picture per design, bundled with the site (public/designs). Here rather than
// in the storefront because the cart corner draws each shirt of a pair in its
// own design too. A slug with no entry just uses its one cutout.
const DESIGN_IMAGES: Record<string, Record<string, string>> = {
  "sleep-shirt": {
    "EX-MODEL": "/designs/sleep-shirt-ex-model.webp",
    "SWEET DREAMS": "/designs/sleep-shirt-sweet-dreams.webp",
  },
};

export function designImagesFor(slug: string): Record<string, string> {
  return DESIGN_IMAGES[slug] ?? {};
}

/** The designs a garment is sold in, or an empty list when it has just the one. */
export function designsFor(slug: string): readonly string[] {
  return DESIGNS[slug] ?? [];
}

/** How many shirts a line is: "A + B" is a pair, anything else is one. */
export function designQuantity(design: string): number {
  return design.includes(PAIR_SEPARATOR) ? 2 : 1;
}

export function withDesign(size: string, design: string): string {
  return `${size}${DESIGN_SEPARATOR}${design}`;
}

/** Two shirts as one line's size text. */
export function pairSize(first: Shirt, second: Shirt): string {
  return [first, second]
    .map((shirt) => withDesign(shirt.size, shirt.design ?? ""))
    .join(PAIR_SEPARATOR);
}

/** Reads an order line's size into its shirts (one, or two for a pair); null
 * when the garment has designs and the line names a design it does not sell, or
 * a size it is not offered in. A garment with no designs passes through whole. */
export function splitDesign(
  slug: string,
  size: string,
): { shirts: Shirt[] } | null {
  const designs = designsFor(slug);
  if (designs.length === 0) return { shirts: [{ size, design: null }] };
  const parts = size.split(PAIR_SEPARATOR);
  if (parts.length > 2) return null;
  const shirts: Shirt[] = [];
  for (const [index, part] of parts.entries()) {
    const at = part.indexOf(DESIGN_SEPARATOR);
    if (at === -1) {
      // The older pair: the second part is just a design, in the first's size.
      if (index === 0) return null;
      shirts.push({ size: shirts[0].size, design: part });
    } else {
      shirts.push({
        size: part.slice(0, at),
        design: part.slice(at + DESIGN_SEPARATOR.length),
      });
    }
  }
  const offered = offeredSizes(slug);
  const valid = shirts.every(
    (shirt) =>
      shirt.design !== null &&
      designs.includes(shirt.design) &&
      (offered === null || offered.includes(shirt.size)),
  );
  return valid ? { shirts } : null;
}
