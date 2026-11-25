// The steps the founder moves a sale through by hand. Pure, so the moves are
// testable without a database. The first three are a paid order's
// `production_stage`; "delivered" is the order's handover status.

import type { OrderStatus } from "@/features/admin/lib/order-status";

export const ORDER_STAGES = [
  "to_do",
  "wholesale_bought",
  "printed",
  "delivered",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export type ProductionStage = "wholesale_bought" | "printed";

export function isOrderStage(value: unknown): value is OrderStage {
  return ORDER_STAGES.includes(value as OrderStage);
}

export function isProductionStage(value: unknown): value is ProductionStage {
  return value === "wholesale_bought" || value === "printed";
}

/** `null` for an order with no work to do: unpaid, refunded or canceled. */
export function stageOf(
  status: OrderStatus,
  production: ProductionStage | null,
): OrderStage | null {
  if (status === "fulfilled" || status === "picked_up") return "delivered";
  if (status === "paid") return production ?? "to_do";
  return null;
}

export function nextStage(stage: OrderStage): OrderStage | null {
  return ORDER_STAGES[ORDER_STAGES.indexOf(stage) + 1] ?? null;
}

export function previousStage(stage: OrderStage): OrderStage | null {
  return ORDER_STAGES[ORDER_STAGES.indexOf(stage) - 1] ?? null;
}

/** One step at a time, either way: a mis-tap is undone, nothing is skipped. */
export function canMoveStage(from: OrderStage, to: OrderStage): boolean {
  return nextStage(from) === to || previousStage(from) === to;
}

export const stageLabel: Record<OrderStage, string> = {
  to_do: "TO DO",
  wholesale_bought: "PIECE BOUGHT",
  printed: "PIECE PRINTED",
  delivered: "PIECE DELIVERED",
};
