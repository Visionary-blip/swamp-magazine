import { describe, expect, it } from "vitest";

import {
  botchedBaseSize,
  botchedSize,
  parseBotchedSize,
  sizeMatches,
} from "./botched";

describe("botched sizes", () => {
  it("writes and reads a fit back", () => {
    const size = botchedSize({ feet: 5, inches: 7, level: 2 });
    expect(size).toBe(`B 5'7" (2/3)`);
    expect(parseBotchedSize(size)).toEqual({ feet: 5, inches: 7, level: 2 });
  });

  it("reads zero and eleven inches", () => {
    expect(parseBotchedSize(`B 6'0" (1/3)`)).toEqual({
      feet: 6,
      inches: 0,
      level: 1,
    });
    expect(parseBotchedSize(`B 4'11" (3/3)`)).toMatchObject({ inches: 11 });
  });

  it("refuses a bare B, a normal size and a fit off the dials", () => {
    expect(parseBotchedSize("B")).toBeNull();
    expect(parseBotchedSize("XL")).toBeNull();
    expect(parseBotchedSize(`B 5'7"`)).toBeNull();
    expect(parseBotchedSize(`B 5'12" (2/3)`)).toBeNull();
    expect(parseBotchedSize(`B 9'1" (2/3)`)).toBeNull();
    expect(parseBotchedSize(`B 5'7" (4/3)`)).toBeNull();
    expect(parseBotchedSize(`B 5'7" (0/3)`)).toBeNull();
  });

  it("lets the B button stand for any Botched size, and only that", () => {
    expect(sizeMatches("B", `B 5'7" (2/3)`)).toBe(true);
    expect(sizeMatches("B", "XL")).toBe(false);
    expect(sizeMatches("XL", "XL")).toBe(true);
  });
});

describe("botchedBaseSize", () => {
  it("prefers the XL, else the largest size, else nothing", () => {
    expect(botchedBaseSize(["S", "M", "XL", "XXL"])).toBe("XL");
    expect(botchedBaseSize(["S", "L", "M"])).toBe("L");
    expect(botchedBaseSize(["ONE SIZE"])).toBeNull();
    expect(botchedBaseSize([])).toBeNull();
  });
});
