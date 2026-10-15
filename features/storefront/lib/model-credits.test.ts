import { describe, expect, it } from "vitest";

import { parseModelCredits } from "./model-credits";

describe("parseModelCredits", () => {
  it("links each known name and keeps the bracketed suffix in the text", () => {
    expect(parseModelCredits("ANANYA (L), JESSICA (R)")).toEqual([
      { text: "ANANYA (L)", href: "https://www.instagram.com/ananya.gomatam/" },
      { text: "JESSICA (R)", href: "https://www.instagram.com/jess.lain/" },
    ]);
  });

  it("accepts line breaks and any letter case", () => {
    expect(parseModelCredits("ylva (L)\nZ (R)").map((c) => c.href)).toEqual([
      "https://www.instagram.com/ylvaoppold/",
      "https://www.instagram.com/zahir.griffith/",
    ]);
  });

  it("leaves a name with no handle as plain text", () => {
    expect(parseModelCredits("KIRBY-ANA (BEHIND)")).toEqual([
      { text: "KIRBY-ANA (BEHIND)", href: null },
    ]);
  });
});
