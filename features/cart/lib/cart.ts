import { z } from "zod";

// The cart is the customer's own scratchpad, kept in the browser: there is no
// cart page and no cart table. Everything here is display data -- name, price
// and picture so the corner can draw itself without a round trip. None of it is
// trusted: checkout sends only slug, size and quantity, and the server prices
// and stocks the order from its own rows.

export type DeliveryChoice = "pickup" | "shipping";

/** A size the garment comes in, as the product page knew it when the item was
 * added -- display data for the cart corner's size menu. */
export type CartSize = { size: string; soldOut: boolean };

export type CartItem = {
  slug: string;
  size: string;
  /** Every size the garment comes in, so the cart corner can offer a change. */
  sizes: CartSize[];
  quantity: number;
  name: string;
  priceCents: number;
  cutoutUrl: string | null;
  cutoutAlt: string;
  /** A small extra that is only sold alongside a garment. Optional so carts
   * saved before add-ons existed still read as plain garments. */
  addOn?: boolean;
};

export type CartState = { items: CartItem[]; delivery: DeliveryChoice };

export const EMPTY_CART: CartState = { items: [], delivery: "pickup" };

export const CART_STORAGE_KEY = "swamp-cart-v1";

/** Mirrors the server's per-line cap so the cart never builds an order the
 * checkout action would refuse as invalid. */
export const MAX_LINE_QUANTITY = 10;
export const MAX_LINES = 20;

const cartSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        size: z.string().min(1),
        // Carts saved before the size menu existed have no list; they simply
        // get no menu until the garment is added again.
        sizes: z
          .array(z.object({ size: z.string().min(1), soldOut: z.boolean() }))
          .default([]),
        quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
        name: z.string(),
        priceCents: z.number().int().min(0),
        cutoutUrl: z.string().nullable(),
        cutoutAlt: z.string(),
        addOn: z.boolean().optional(),
      }),
    )
    .max(MAX_LINES),
  delivery: z.enum(["pickup", "shipping"]),
});

/** Anything unreadable -- first visit, a hand-edited value, an older shape --
 * is an empty cart rather than an error. */
export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return EMPTY_CART;
  try {
    const parsed = cartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

/** The same garment in the same size is one line with a higher quantity; first
 * added stays first, which is the order the corner draws them in. */
/** An add-on is never bought on its own: with no garment left in the cart, the
 * add-ons go too, so the cart can never hold an order the server would refuse. */
export function pruneAddOns(items: CartItem[]): CartItem[] {
  return items.some((item) => !item.addOn)
    ? items
    : items.filter((item) => !item.addOn);
}

export function addToCart(items: CartItem[], added: CartItem): CartItem[] {
  const index = items.findIndex(
    (item) => item.slug === added.slug && item.size === added.size,
  );
  if (index === -1) {
    return items.length >= MAX_LINES ? items : [...items, added];
  }
  return items.map((item, position) =>
    position === index
      ? {
          ...item,
          quantity: Math.min(MAX_LINE_QUANTITY, item.quantity + added.quantity),
        }
      : item,
  );
}

export function removeFromCart(
  items: CartItem[],
  slug: string,
  size: string,
): CartItem[] {
  return items.filter((item) => !(item.slug === slug && item.size === size));
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Smallest to largest. A size that is not a standard letter size keeps its
 * place after the known ones, in the order it came. */
export function sortSizes(sizes: CartSize[]): CartSize[] {
  const rank = (size: string) => {
    const index = SIZE_ORDER.indexOf(size.toUpperCase());
    return index === -1 ? SIZE_ORDER.length : index;
  };
  return [...sizes].sort((a, b) => rank(a.size) - rank(b.size));
}

/** Swaps one line's size in place. If the garment is already in the cart in the
 * new size the two lines become one, quantities added, at the earlier spot. */
export function changeCartSize(
  items: CartItem[],
  slug: string,
  from: string,
  to: string,
): CartItem[] {
  if (from === to) return items;
  const source = items.find((item) => item.slug === slug && item.size === from);
  if (!source) return items;

  const twin = items.find((item) => item.slug === slug && item.size === to);
  if (!twin) {
    return items.map((item) =>
      item === source ? { ...item, size: to } : item,
    );
  }

  const quantity = Math.min(MAX_LINE_QUANTITY, source.quantity + twin.quantity);
  const keepAt = Math.min(items.indexOf(source), items.indexOf(twin));
  const merged: CartItem = { ...twin, quantity };
  return items.flatMap((item, index) =>
    item === source || item === twin
      ? index === keepAt
        ? [merged]
        : []
      : [item],
  );
}

/** Moves ONE unit of a line to another size, for a cart that shows each unit as
 * its own copy of the garment. A single unit just changes size in place; one of
 * several leaves the rest where they are and the moved one lands in the line of
 * the new size, or in a new line right after the source so it sits beside it. */
export function moveOneToSize(
  items: CartItem[],
  slug: string,
  from: string,
  to: string,
): CartItem[] {
  if (from === to) return items;
  const sourceIndex = items.findIndex(
    (item) => item.slug === slug && item.size === from,
  );
  if (sourceIndex === -1) return items;
  const source = items[sourceIndex];
  if (source.quantity <= 1) return changeCartSize(items, slug, from, to);

  const twin = items.find((item) => item.slug === slug && item.size === to);
  if (twin && twin.quantity >= MAX_LINE_QUANTITY) return items;
  if (!twin && items.length >= MAX_LINES) return items;

  const lowered = items.map((item, index) =>
    index === sourceIndex ? { ...item, quantity: item.quantity - 1 } : item,
  );
  if (twin) {
    return lowered.map((item) =>
      item === twin ? { ...item, quantity: item.quantity + 1 } : item,
    );
  }
  return [
    ...lowered.slice(0, sourceIndex + 1),
    { ...source, size: to, quantity: 1 },
    ...lowered.slice(sourceIndex + 1),
  ];
}

/** Nudges one line's quantity up or down by `delta`; a line that reaches zero is
 * removed, and a line never passes the cap the server enforces. */
export function adjustQuantity(
  items: CartItem[],
  slug: string,
  size: string,
  delta: number,
): CartItem[] {
  return items.flatMap((item) => {
    if (item.slug !== slug || item.size !== size) return [item];
    const quantity = Math.min(MAX_LINE_QUANTITY, item.quantity + delta);
    return quantity < 1 ? [] : [{ ...item, quantity }];
  });
}
