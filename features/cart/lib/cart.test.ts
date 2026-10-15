import { describe, expect, it } from "vitest";

import {
  MAX_LINE_QUANTITY,
  adjustQuantity,
  addToCart,
  cartCount,
  cartSubtotalCents,
  changeCartSize,
  parseStoredCart,
  removeFromCart,
  sortSizes,
  type CartItem,
} from "./cart";

function item(overrides: Partial<CartItem> = {}): CartItem {
  return {
    slug: "star-shorts",
    size: "M",
    sizes: [],
    quantity: 1,
    name: "Star Shorts",
    priceCents: 2500,
    cutoutUrl: null,
    cutoutAlt: "",
    ...overrides,
  };
}

describe("addToCart", () => {
  it("keeps the first thing added first", () => {
    const cart = addToCart([item()], item({ slug: "college-arch" }));
    expect(cart.map((line) => line.slug)).toEqual([
      "star-shorts",
      "college-arch",
    ]);
  });

  it("merges the same garment and size into one line", () => {
    const cart = addToCart([item()], item());
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it("keeps different sizes of one garment apart", () => {
    expect(addToCart([item()], item({ size: "L" }))).toHaveLength(2);
  });

  it("never lets a line pass the cap the server enforces", () => {
    const cart = addToCart([item({ quantity: MAX_LINE_QUANTITY })], item());
    expect(cart[0].quantity).toBe(MAX_LINE_QUANTITY);
  });
});

describe("removeFromCart", () => {
  it("removes exactly the matching line", () => {
    const cart = removeFromCart(
      [item(), item({ size: "L" })],
      "star-shorts",
      "M",
    );
    expect(cart.map((line) => line.size)).toEqual(["L"]);
  });
});

describe("totals", () => {
  it("counts garments and sums display prices by quantity", () => {
    const cart = [item({ quantity: 2 }), item({ slug: "x", priceCents: 3000 })];
    expect(cartCount(cart)).toBe(3);
    expect(cartSubtotalCents(cart)).toBe(8000);
  });
});

describe("parseStoredCart", () => {
  it("reads a cart it wrote", () => {
    const stored = { items: [item()], delivery: "shipping" };
    expect(parseStoredCart(JSON.stringify(stored))).toEqual(stored);
  });

  it("treats anything unreadable as an empty cart", () => {
    for (const raw of [null, "", "{", '{"items":"no"}', '{"items":[]}']) {
      expect(parseStoredCart(raw)).toEqual({ items: [], delivery: "pickup" });
    }
  });
});

describe("sortSizes", () => {
  it("orders letter sizes smallest to largest", () => {
    const sorted = sortSizes(
      ["XL", "S", "L", "XS", "M"].map((size) => ({ size, soldOut: false })),
    );
    expect(sorted.map((entry) => entry.size)).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
    ]);
  });

  it("leaves unfamiliar sizes after the known ones", () => {
    const sorted = sortSizes(
      ["ONE", "M", "S"].map((size) => ({ size, soldOut: false })),
    );
    expect(sorted.map((entry) => entry.size)).toEqual(["S", "M", "ONE"]);
  });
});

describe("changeCartSize", () => {
  it("changes the size in place, keeping the line where it was", () => {
    const cart = changeCartSize(
      [item(), item({ slug: "college-arch" })],
      "star-shorts",
      "M",
      "L",
    );
    expect(cart.map((line) => `${line.slug}:${line.size}`)).toEqual([
      "star-shorts:L",
      "college-arch:M",
    ]);
  });

  it("folds into an existing line of the new size", () => {
    const cart = changeCartSize(
      [
        item({ size: "L", quantity: 2 }),
        item({ slug: "college-arch" }),
        item(),
      ],
      "star-shorts",
      "M",
      "L",
    );
    expect(
      cart.map((line) => `${line.slug}:${line.size}:${line.quantity}`),
    ).toEqual(["star-shorts:L:3", "college-arch:M:1"]);
  });

  it("does nothing for the size it already is, or a line that is not there", () => {
    const cart = [item()];
    expect(changeCartSize(cart, "star-shorts", "M", "M")).toBe(cart);
    expect(changeCartSize(cart, "star-shorts", "S", "L")).toBe(cart);
  });
});

describe("adjustQuantity", () => {
  it("raises and lowers a line", () => {
    const up = adjustQuantity([item()], "star-shorts", "M", 1);
    expect(up[0].quantity).toBe(2);
    expect(adjustQuantity(up, "star-shorts", "M", -1)[0].quantity).toBe(1);
  });

  it("removes a line that reaches zero", () => {
    expect(adjustQuantity([item()], "star-shorts", "M", -1)).toEqual([]);
  });

  it("stops at the cap and leaves other lines alone", () => {
    const cart = [item({ quantity: MAX_LINE_QUANTITY }), item({ size: "L" })];
    const next = adjustQuantity(cart, "star-shorts", "M", 1);
    expect(next[0].quantity).toBe(MAX_LINE_QUANTITY);
    expect(next[1]).toBe(cart[1]);
  });
});
