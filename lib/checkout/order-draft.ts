import type {
  CreateCheckoutSessionResult,
  DeliveryMethod,
} from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";

import { findCodeAddOn } from "./code-add-ons";

// The pure half of createCheckoutSession: given rows already read from the DB,
// decide whether this is a sellable order and what it costs. Pulled out of the
// server action so the guards that lose money when they are wrong -- sold-out
// rejection, price and shipping arithmetic -- are testable without Stripe keys
// or a database (BD-5).
//
// The DeliveryMethod type is imported from the action rather than redeclared so
// the frozen E-to-F contract stays the single source of truth; it is a type-only
// import, so nothing from the "use server" module survives into this bundle.

export type VariantRow = {
  id: string;
  size: string;
  inventory_count: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price_cents: number;
  active: boolean;
  /** Sold only alongside a garment. Absent on a database the add_ons migration
   * has not reached, which reads as a plain garment. */
  is_add_on?: boolean;
  product_variants: VariantRow[];
};

/** What the buyer asked for: a product, a size and how many. Prices are never
 * part of a request -- they come off the product rows. */
export type OrderRequestLine = {
  slug: string;
  size: string;
  quantity: number;
};

export type OrderDraftLine = {
  /** Null for an add-on that lives in code rather than the products table. */
  productId: string | null;
  variantId: string | null;
  productName: string;
  size: string;
  unitPriceCents: number;
  quantity: number;
};

export type OrderDraft = {
  lines: OrderDraftLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  delivery: DeliveryMethod;
};

type FailureReason = Extract<
  CreateCheckoutSessionResult,
  { status: "error" }
>["reason"];

export type OrderDraftResult =
  | { status: "success"; draft: OrderDraft }
  | {
      status: "error";
      reason: FailureReason;
      /** Which line a `sold-out` refusal is about, so the cart can drop it. */
      item?: { slug: string; size: string };
    };

// One shipping charge per order, however many lines it has: the flat rate is the
// cost of sending the parcel, not of each garment in it.
export function resolveOrderDraft(
  products: ProductRow[],
  requested: OrderRequestLine[],
  delivery: DeliveryMethod,
): OrderDraftResult {
  if (requested.length === 0) {
    return { status: "error", reason: "invalid-input" };
  }

  // The same garment twice is one line of two, so stock is checked against the
  // total being asked for rather than each tap on its own.
  const merged = new Map<string, OrderRequestLine>();
  for (const line of requested) {
    const key = `${line.slug}\u0000${line.size}`;
    const existing = merged.get(key);
    merged.set(key, {
      ...line,
      quantity: (existing?.quantity ?? 0) + line.quantity,
    });
  }

  const lines: OrderDraftLine[] = [];
  let hasGarment = false;
  for (const line of merged.values()) {
    const product = products.find((row) => row.slug === line.slug);

    // Add-ons that live in code have no row to read: price and name come from
    // the server's own list, never the request, and there is no stock to check.
    const codeAddOn = product ? undefined : findCodeAddOn(line.slug);
    if (codeAddOn) {
      if (line.size !== codeAddOn.size) {
        return { status: "error", reason: "not-found" };
      }
      lines.push({
        productId: null,
        variantId: null,
        productName: codeAddOn.name,
        size: codeAddOn.size,
        unitPriceCents: codeAddOn.priceCents,
        quantity: line.quantity,
      });
      continue;
    }

    // An inactive product is invisible to the storefront's RLS policy, so
    // reaching here with one means a stale tab or a hand-made request -- same
    // answer either way, and deliberately not a distinct reason that would
    // confirm it exists.
    if (!product || !product.active) {
      return { status: "error", reason: "not-found" };
    }

    const variant = product.product_variants.find(
      (row) => row.size === line.size,
    );
    if (!variant) {
      return { status: "error", reason: "not-found" };
    }

    if (variant.inventory_count < line.quantity) {
      return {
        status: "error",
        reason: "sold-out",
        item: { slug: line.slug, size: line.size },
      };
    }

    if (!product.is_add_on) hasGarment = true;

    lines.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      size: variant.size,
      unitPriceCents: product.price_cents,
      quantity: line.quantity,
    });
  }

  // An add-on is the gum at the register: it rides along with a real purchase.
  // The cart already drops add-ons when the last garment goes, but a request is
  // a request -- the rule lives here, where it cannot be skipped.
  if (!hasGarment) {
    return { status: "error", reason: "invalid-input" };
  }

  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );
  const shippingCents =
    delivery === "shipping" ? dials.shippingFlatRateCents : 0;

  return {
    status: "success",
    draft: {
      lines,
      subtotalCents,
      shippingCents,
      totalCents: subtotalCents + shippingCents,
      delivery,
    },
  };
}
