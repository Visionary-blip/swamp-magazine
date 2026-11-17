// A garment that comes in more than one design (the Sleep Shirt: EX-MODEL,
// SWEET DREAMS, or BOTH). The design is not a variant in the database -- stock is
// per size -- so it rides in the order line's size text ("M / SWEET DREAMS"), like
// Botched does, and shows on the order, the admin list and the emails with no new
// column. BOTH is two shirts, one of each, so its line is bought two at a time.

export const DESIGN_SEPARATOR = " / ";

const DESIGNS: Record<string, readonly string[]> = {
  "sleep-shirt": ["EX-MODEL", "SWEET DREAMS", "BOTH"],
};

/** The designs a garment is sold in, or an empty list when it has just the one. */
export function designsFor(slug: string): readonly string[] {
  return DESIGNS[slug] ?? [];
}

/** How many shirts a design takes: BOTH is a pair, anything else is one. */
export function designQuantity(design: string): number {
  return design === "BOTH" ? 2 : 1;
}

export function withDesign(size: string, design: string): string {
  return `${size}${DESIGN_SEPARATOR}${design}`;
}

/** Splits an order line's size into the real size and its design; null when the
 * garment has designs and the line names none of them. A garment with no designs
 * passes through whole. */
export function splitDesign(
  slug: string,
  size: string,
): { size: string; design: string | null } | null {
  const designs = designsFor(slug);
  if (designs.length === 0) return { size, design: null };
  const at = size.indexOf(DESIGN_SEPARATOR);
  if (at === -1) return null;
  const design = size.slice(at + DESIGN_SEPARATOR.length);
  return designs.includes(design) ? { size: size.slice(0, at), design } : null;
}
