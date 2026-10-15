import { describe, expect, it } from "vitest";

import { dials } from "@/config/dials";
import { resolveOrderDraft, type ProductRow } from "./order-draft";

// These guards are the ones that lose money quietly: a sold-out size that still
// takes payment, or a shipped order charged at the pickup price.

function product(overrides: Partial<ProductRow> = {}): ProductRow {
  return {
    id: "prod-1",
    slug: "vamp-tee",
    name: "Vamp Tee",
    price_cents: 2000,
    active: true,
    product_variants: [
      { id: "var-s", size: "S", inventory_count: 12 },
      { id: "var-m", size: "M", inventory_count: 0 },
    ],
    ...overrides,
  };
}

const shorts = product({
  id: "prod-2",
  slug: "star-shorts",
  name: "Star Shorts",
  price_cents: 2500,
  product_variants: [{ id: "var-sh-m", size: "M", inventory_count: 3 }],
});

const line = (slug: string, size: string, quantity = 1) => ({
  slug,
  size,
  quantity,
});

describe("resolveOrderDraft", () => {
  it("refuses a size with no stock and names the line", () => {
    expect(
      resolveOrderDraft([product()], [line("vamp-tee", "M")], "pickup"),
    ).toEqual({
      status: "error",
      reason: "sold-out",
      item: { slug: "vamp-tee", size: "M" },
    });
  });

  it("refuses a size the product does not have", () => {
    expect(
      resolveOrderDraft([product()], [line("vamp-tee", "XXL")], "pickup"),
    ).toEqual({ status: "error", reason: "not-found" });
  });

  it("refuses a missing product", () => {
    expect(resolveOrderDraft([], [line("vamp-tee", "S")], "pickup")).toEqual({
      status: "error",
      reason: "not-found",
    });
  });

  it("refuses an inactive product without admitting it exists", () => {
    const result = resolveOrderDraft(
      [product({ active: false })],
      [line("vamp-tee", "S")],
      "pickup",
    );
    expect(result).toEqual({ status: "error", reason: "not-found" });
  });

  it("refuses an empty order", () => {
    expect(resolveOrderDraft([product()], [], "pickup")).toEqual({
      status: "error",
      reason: "invalid-input",
    });
  });

  it("prices a pickup order at the product price with no shipping", () => {
    const result = resolveOrderDraft(
      [product()],
      [line("vamp-tee", "S")],
      "pickup",
    );
    expect(result).toEqual({
      status: "success",
      draft: {
        lines: [
          {
            productId: "prod-1",
            variantId: "var-s",
            productName: "Vamp Tee",
            size: "S",
            unitPriceCents: 2000,
            quantity: 1,
          },
        ],
        subtotalCents: 2000,
        shippingCents: 0,
        totalCents: 2000,
        delivery: "pickup",
      },
    });
  });

  it("adds exactly the shipping dial for a shipped order", () => {
    const result = resolveOrderDraft(
      [product()],
      [line("vamp-tee", "S")],
      "shipping",
    );
    if (result.status !== "success") throw new Error("expected a draft");
    expect(result.draft.shippingCents).toBe(dials.shippingFlatRateCents);
    expect(result.draft.totalCents).toBe(2000 + dials.shippingFlatRateCents);
  });

  it("reads the price from the row, never from the caller", () => {
    const result = resolveOrderDraft(
      [product({ price_cents: 2500 })],
      [line("vamp-tee", "S")],
      "pickup",
    );
    if (result.status !== "success") throw new Error("expected a draft");
    expect(result.draft.lines[0].unitPriceCents).toBe(2500);
  });

  it("sums several products and charges shipping once", () => {
    const result = resolveOrderDraft(
      [product(), shorts],
      [line("vamp-tee", "S"), line("star-shorts", "M")],
      "shipping",
    );
    if (result.status !== "success") throw new Error("expected a draft");
    expect(result.draft.lines).toHaveLength(2);
    expect(result.draft.subtotalCents).toBe(4500);
    expect(result.draft.totalCents).toBe(4500 + dials.shippingFlatRateCents);
  });

  it("merges the same garment into one line of two", () => {
    const result = resolveOrderDraft(
      [product()],
      [line("vamp-tee", "S"), line("vamp-tee", "S")],
      "pickup",
    );
    if (result.status !== "success") throw new Error("expected a draft");
    expect(result.draft.lines).toHaveLength(1);
    expect(result.draft.lines[0].quantity).toBe(2);
    expect(result.draft.totalCents).toBe(4000);
  });

  it("checks stock against the merged quantity, not each tap", () => {
    expect(
      resolveOrderDraft(
        [shorts],
        [line("star-shorts", "M", 2), line("star-shorts", "M", 2)],
        "pickup",
      ),
    ).toEqual({
      status: "error",
      reason: "sold-out",
      item: { slug: "star-shorts", size: "M" },
    });
  });

  it("refuses the whole order when any one line is sold out", () => {
    const result = resolveOrderDraft(
      [product(), shorts],
      [line("star-shorts", "M"), line("vamp-tee", "M")],
      "pickup",
    );
    expect(result).toMatchObject({ status: "error", reason: "sold-out" });
  });
});
