import { dials } from "@/config/dials";

// Garments sold at a better price in twos. The rule lives in code, keyed by slug
// like Botched and the issues; the price is a dial. The browser uses the same
// arithmetic to show totals, but the server prices the order from it again.

const PAIR_PRICES: Record<string, number> = {
  "sleep-shirt": dials.sleepShirtTwoPackCents,
};

/** The price of two of this garment together, or null when it has no two-pack. */
export function twoPackCents(slug: string): number | null {
  return PAIR_PRICES[slug] ?? null;
}

/** What `quantity` of a garment costs: each full pair at the two-pack price, the
 * odd one out at the single price. */
export function lineTotalCents(
  slug: string,
  unitPriceCents: number,
  quantity: number,
): number {
  const pair = twoPackCents(slug);
  if (pair === null) return unitPriceCents * quantity;
  return (
    Math.floor(quantity / 2) * pair + (quantity % 2) * unitPriceCents
  );
}

/** The order lines a quantity is charged as. Stripe takes whole-cent unit
 * amounts, so a pair is two units that add up to the two-pack price (the extra
 * cent, if odd, on the first); the lines share one variant, so stock still drops
 * by the quantity. */
export function priceLines(
  slug: string,
  unitPriceCents: number,
  quantity: number,
): { unitPriceCents: number; quantity: number }[] {
  const pair = twoPackCents(slug);
  if (pair === null) return [{ unitPriceCents, quantity }];
  const pairs = Math.floor(quantity / 2);
  return [
    { unitPriceCents: Math.ceil(pair / 2), quantity: pairs },
    { unitPriceCents: Math.floor(pair / 2), quantity: pairs },
    { unitPriceCents, quantity: quantity % 2 },
  ].filter((line) => line.quantity > 0);
}
