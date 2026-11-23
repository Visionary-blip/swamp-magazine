import { describe, expect, it } from "vitest";

import type { CatalogProduct } from "./catalog";
import { getProductNeighbors } from "./product-neighbors";

function product(slug: string): CatalogProduct {
  return {
    slug,
    name: slug.toUpperCase(),
    priceCents: 2500,
    modelCredits: null,
    cutout: null,
    background: null,
    variants: [],
  };
}

// The National Issue's pieces come first in the grid, then the first issue's,
// whatever order the database returned them in.
const CATALOG = [
  product("vamp-tee"),
  product("fc-hoodie"),
  product("lurker-tee"),
  product("dog-tee"),
];

describe("getProductNeighbors", () => {
  it("follows the grid's order, not the database's", () => {
    expect(getProductNeighbors(CATALOG, "fc-hoodie")).toEqual({
      previous: null,
      next: { slug: "dog-tee", name: "DOG-TEE" },
    });
  });

  it("crosses from one issue into the next", () => {
    expect(getProductNeighbors(CATALOG, "dog-tee")).toEqual({
      previous: { slug: "fc-hoodie", name: "FC-HOODIE" },
      next: { slug: "vamp-tee", name: "VAMP-TEE" },
    });
  });

  it("has no next after the last product", () => {
    expect(getProductNeighbors(CATALOG, "lurker-tee").next).toBeNull();
  });

  it("gives nothing for a slug that is not in the catalog", () => {
    expect(getProductNeighbors(CATALOG, "nope")).toEqual({
      previous: null,
      next: null,
    });
  });
});
