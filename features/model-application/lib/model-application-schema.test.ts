import { describe, expect, it } from "vitest";

import {
  creativeApplicationSchema,
  ideaSubmissionSchema,
  isValidContact,
  modelApplicationSchema,
} from "./model-application-schema";

describe("isValidContact", () => {
  it.each([
    "a@b.co",
    "(757) 221-1234",
    "+17572211234",
    "@swamp_magazine",
    "lalo.farro",
  ])("accepts %s", (value) => expect(isValidContact(value)).toBe(true));

  it.each(["", "two words", "not an email@", "!!"])("rejects %s", (value) =>
    expect(isValidContact(value)).toBe(false),
  );
});

describe("modelApplicationSchema", () => {
  it("requires every field", () => {
    expect(
      modelApplicationSchema.safeParse({
        name: "A",
        location: "",
        contact: "a@b.co",
      }).success,
    ).toBe(false);
  });
});

describe("modelApplicationSchema gender", () => {
  const base = { name: "A", location: "B", contact: "a@b.co" };

  it("accepts the three options and rejects anything else", () => {
    for (const gender of ["male", "female", "other"]) {
      expect(
        modelApplicationSchema.safeParse({ ...base, gender }).success,
      ).toBe(true);
    }
    expect(
      modelApplicationSchema.safeParse({ ...base, gender: "x" }).success,
    ).toBe(false);
    expect(modelApplicationSchema.safeParse(base).success).toBe(false);
  });
});

describe("creativeApplicationSchema", () => {
  const base = {
    name: "A",
    location: "B",
    speciality: "VIDEOGRAPHER",
    contact: "@a",
  };

  it("takes a free-text speciality", () => {
    expect(creativeApplicationSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a missing speciality or a bad contact", () => {
    expect(
      creativeApplicationSchema.safeParse({ ...base, speciality: " " }).success,
    ).toBe(false);
    expect(
      creativeApplicationSchema.safeParse({ ...base, contact: "two words" })
        .success,
    ).toBe(false);
  });
});

describe("ideaSubmissionSchema", () => {
  const base = { name: "A", contact: "a@b.co", idea: "a swamp radio" };

  it("requires the idea and caps its length", () => {
    expect(ideaSubmissionSchema.safeParse(base).success).toBe(true);
    expect(ideaSubmissionSchema.safeParse({ ...base, idea: "" }).success).toBe(
      false,
    );
    expect(
      ideaSubmissionSchema.safeParse({ ...base, idea: "x".repeat(2001) })
        .success,
    ).toBe(false);
  });
});
