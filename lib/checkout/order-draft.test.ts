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

describe("resolveOrderDraft add-ons", () => {
  const gum = product({
    id: "prod-gum",
    slug: "sticker-pack",
    name: "Sticker Pack",
    price_cents: 300,
    is_add_on: true,
    product_variants: [{ id: "var-gum", size: "ONE SIZE", inventory_count: 5 }],
  });

  it("refuses an order made only of add-ons", () => {
    expect(
      resolveOrderDraft([gum], [line("sticker-pack", "ONE SIZE")], "pickup"),
    ).toEqual({ status: "error", reason: "invalid-input" });
  });

  it("sells an add-on alongside a garment, priced from the row", () => {
    const result = resolveOrderDraft(
      [product(), gum],
      [line("vamp-tee", "S"), line("sticker-pack", "ONE SIZE", 2)],
      "pickup",
    );
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.draft.totalCents).toBe(2000 + 2 * 300);
    }
  });

  it("still checks an add-on's stock", () => {
    const result = resolveOrderDraft(
      [product(), gum],
      [line("vamp-tee", "S"), line("sticker-pack", "ONE SIZE", 6)],
      "pickup",
    );
    expect(result).toEqual({
      status: "error",
      reason: "sold-out",
      item: { slug: "sticker-pack", size: "ONE SIZE" },
    });
  });
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

describe("resolveOrderDraft code add-ons", () => {
  it("prices the lighter from the server's list, with no row behind it", () => {
    const result = resolveOrderDraft(
      [shorts],
      [line("star-shorts", "M"), line("lighter", "ONE SIZE", 2)],
      "pickup",
    );
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.draft.lines[1]).toMatchObject({
      productId: null,
      variantId: null,
      unitPriceCents: dials.lighterPriceCents,
      quantity: 2,
    });
  });

  it("refuses the lighter on its own", () => {
    const result = resolveOrderDraft(
      [],
      [line("lighter", "ONE SIZE")],
      "pickup",
    );
    expect(result.status).toBe("error");
  });

  it("refuses a size the lighter does not come in", () => {
    const result = resolveOrderDraft(
      [shorts],
      [line("star-shorts", "M"), line("lighter", "XL")],
      "pickup",
    );
    expect(result).toMatchObject({ status: "error", reason: "not-found" });
  });
});

describe("resolveOrderDraft botched sizes", () => {
  const tee = product({
    product_variants: [
      { id: "var-s", size: "S", inventory_count: 5 },
      { id: "var-xl", size: "XL", inventory_count: 2 },
    ],
  });

  it("cuts a Botched line from the XL and keeps the height on the line", () => {
    const result = resolveOrderDraft(
      [tee],
      [line("vamp-tee", `B 5'7" (2/3)`)],
      "pickup",
    );
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.draft.lines[0]).toMatchObject({
      variantId: "var-xl",
      size: `B 5'7" (2/3)`,
      unitPriceCents: 2000,
    });
  });

  it("counts Botched and plain XL lines against the same stock", () => {
    const result = resolveOrderDraft(
      [tee],
      [
        line("vamp-tee", `B 5'7" (2/3)`, 1),
        line("vamp-tee", `B 6'1" (3/3)`, 1),
        line("vamp-tee", "XL", 1),
      ],
      "pickup",
    );
    expect(result).toMatchObject({ status: "error", reason: "sold-out" });
  });

  it("refuses a bare B", () => {
    expect(
      resolveOrderDraft([tee], [line("vamp-tee", "B")], "pickup"),
    ).toMatchObject({ status: "error", reason: "not-found" });
  });

  it("cuts a Botched line from the largest size when there is no XL", () => {
    const noXlTee = product({
      id: "prod-2",
      slug: "lurker-tee",
      name: "Lurker Tee",
      product_variants: [
        { id: "var-t-s", size: "S", inventory_count: 4 },
        { id: "var-t-l", size: "L", inventory_count: 1 },
        { id: "var-t-m", size: "M", inventory_count: 4 },
      ],
    });
    const result = resolveOrderDraft(
      [noXlTee],
      [line("lurker-tee", `B 5'7" (1/3)`)],
      "pickup",
    );
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.draft.lines[0]).toMatchObject({ variantId: "var-t-l" });
  });

  it("refuses Botched on anything that is not a tee", () => {
    const hoodie = product({
      id: "prod-3",
      slug: "fc-hoodie",
      name: "FC Hoodie",
      product_variants: [{ id: "var-h-xl", size: "XL", inventory_count: 4 }],
    });
    expect(
      resolveOrderDraft(
        [hoodie],
        [line("fc-hoodie", `B 5'7" (2/3)`)],
        "pickup",
      ),
    ).toMatchObject({ status: "error", reason: "invalid-input" });
  });
});

describe("resolveOrderDraft two-pack", () => {
  const sleep = product({
    id: "prod-sleep",
    slug: "sleep-shirt",
    name: "Sleep Shirt",
    price_cents: 1500,
    product_variants: [
      { id: "var-sl-l", size: "L", inventory_count: 5 },
      { id: "var-sl-xl", size: "XL", inventory_count: 1 },
    ],
  });
  const total = (quantity: number) => {
    const result = resolveOrderDraft(
      [sleep],
      [line("sleep-shirt", "L / EX-MODEL", quantity)],
      "pickup",
    );
    if (result.status !== "success") throw new Error("expected success");
    return result.draft;
  };

  it("charges one at the single price, two at the pack price", () => {
    expect(total(1).totalCents).toBe(1500);
    expect(total(2).totalCents).toBe(dials.sleepShirtTwoPackCents);
  });

  it("charges a pair plus an odd one out", () => {
    expect(total(3).totalCents).toBe(dials.sleepShirtTwoPackCents + 1500);
    expect(total(4).totalCents).toBe(dials.sleepShirtTwoPackCents * 2);
  });

  it("keeps whole-cent units and the full quantity on the variant", () => {
    const draft = total(3);
    expect(draft.lines.every((l) => Number.isInteger(l.unitPriceCents))).toBe(
      true,
    );
    expect(draft.lines.reduce((sum, l) => sum + l.quantity, 0)).toBe(3);
  });

  it("still checks stock against the whole quantity", () => {
    expect(
      resolveOrderDraft(
        [sleep],
        [line("sleep-shirt", "L / EX-MODEL", 6)],
        "pickup",
      ),
    ).toMatchObject({ status: "error", reason: "sold-out" });
  });

  it("refuses a Sleep Shirt line that names no design", () => {
    expect(
      resolveOrderDraft([sleep], [line("sleep-shirt", "L")], "pickup"),
    ).toMatchObject({ status: "error", reason: "invalid-input" });
  });

  it("refuses a pair of designs bought one shirt at a time", () => {
    expect(
      resolveOrderDraft(
        [sleep],
        [line("sleep-shirt", "L / EX-MODEL + XL / SWEET DREAMS", 1)],
        "pickup",
      ),
    ).toMatchObject({ status: "error", reason: "invalid-input" });
  });

  it("prices a pair of designs at the two-pack price", () => {
    const result = resolveOrderDraft(
      [sleep],
      [line("sleep-shirt", "L / EX-MODEL + XL / SWEET DREAMS", 2)],
      "pickup",
    );
    expect(result).toMatchObject({
      status: "success",
      draft: { totalCents: dials.sleepShirtTwoPackCents },
    });
  });

  it("gives each shirt of a pair its own size and stock", () => {
    const result = resolveOrderDraft(
      [sleep],
      [line("sleep-shirt", "L / EX-MODEL + XL / SWEET DREAMS", 2)],
      "pickup",
    );
    if (result.status !== "success") throw new Error("expected success");
    expect(result.draft.lines.map((l) => [l.variantId, l.size])).toEqual([
      ["var-sl-l", "L / EX-MODEL"],
      ["var-sl-xl", "XL / SWEET DREAMS"],
    ]);
    expect(result.draft.totalCents).toBe(dials.sleepShirtTwoPackCents);
  });

  it("refuses a pair when either size is out of stock", () => {
    expect(
      resolveOrderDraft(
        [sleep],
        [line("sleep-shirt", "XL / EX-MODEL + XL / SWEET DREAMS", 2)],
        "pickup",
      ),
    ).toMatchObject({ status: "error", reason: "sold-out" });
  });

  it("still reads a pair written with one size", () => {
    expect(
      resolveOrderDraft(
        [sleep],
        [line("sleep-shirt", "L / EX-MODEL + SWEET DREAMS", 2)],
        "pickup",
      ),
    ).toMatchObject({ status: "success" });
  });

  it("only sells the Sleep Shirt in L and XL", () => {
    const small = product({
      id: "prod-sleep",
      slug: "sleep-shirt",
      price_cents: 1500,
      product_variants: [{ id: "var-sl-m", size: "M", inventory_count: 5 }],
    });
    expect(
      resolveOrderDraft(
        [small],
        [line("sleep-shirt", "M / EX-MODEL")],
        "pickup",
      ),
    ).toMatchObject({ status: "error", reason: "invalid-input" });
  });
});
