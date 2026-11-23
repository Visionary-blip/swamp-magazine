import { describe, expect, it } from "vitest";

import { getProductSpecs } from "./product-specs";

describe("getProductSpecs", () => {
  it("says 100% cotton for a shirt", () => {
    expect(getProductSpecs("dog-tee")).toEqual([
      "100% Cotton",
      "Handprinted by one guy in a bed room",
    ]);
  });

  it("gives the crop its stretch blend", () => {
    expect(getProductSpecs("croc-crop")[0]).toBe(
      "90/10% Cotton/Polyester blend for stretch",
    );
  });

  it("gives the hoodie its structured blend", () => {
    expect(getProductSpecs("fc-hoodie")[0]).toBe(
      "80/20% Cotton/Polyester blend for structure",
    );
  });

  it("keeps the printing line on a product with no fabric line", () => {
    expect(getProductSpecs("star-shorts")).toEqual([
      "Handprinted by one guy in a bed room",
    ]);
  });
});
