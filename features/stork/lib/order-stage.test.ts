import { describe, expect, it } from "vitest";

import { canMoveStage, nextStage, previousStage, stageOf } from "./order-stage";

describe("stageOf", () => {
  it("reads a paid order's stage from the production column", () => {
    expect(stageOf("paid", null)).toBe("to_do");
    expect(stageOf("paid", "printed")).toBe("printed");
  });

  it("calls either handover status delivered", () => {
    expect(stageOf("picked_up", null)).toBe("delivered");
    expect(stageOf("fulfilled", "printed")).toBe("delivered");
  });

  it("gives no stage to an order with no work to do", () => {
    expect(stageOf("pending", null)).toBeNull();
    expect(stageOf("refunded", "printed")).toBeNull();
    expect(stageOf("canceled", null)).toBeNull();
  });
});

describe("stage moves", () => {
  it("walks to do, wholesale bought, printed, delivered", () => {
    expect(nextStage("to_do")).toBe("wholesale_bought");
    expect(nextStage("wholesale_bought")).toBe("printed");
    expect(nextStage("printed")).toBe("delivered");
    expect(nextStage("delivered")).toBeNull();
    expect(previousStage("to_do")).toBeNull();
  });

  it("allows one step either way and no skipping", () => {
    expect(canMoveStage("printed", "wholesale_bought")).toBe(true);
    expect(canMoveStage("to_do", "printed")).toBe(false);
    expect(canMoveStage("to_do", "delivered")).toBe(false);
  });
});
