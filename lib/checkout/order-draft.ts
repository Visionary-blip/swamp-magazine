import type {
  CreateCheckoutSessionResult,
  DeliveryMethod,
} from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";

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
  productId: string;
  variantId: string;
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
  for (const line of merged.values()) {
    const product = products.find((row) => row.slug === line.slug);

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

    lines.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      size: variant.size,
      unitPriceCents: product.price_cents,
      quantity: line.quantity,
    });
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
