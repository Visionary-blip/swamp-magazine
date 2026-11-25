"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { resolveAdminAccess } from "@/features/admin/lib/admin-guard";
import { storkPath } from "@/features/admin/lib/admin-routes";
import {
  canMoveStage,
  isOrderStage,
  stageOf,
  type OrderStage,
} from "@/features/stork/lib/order-stage";
import { getPurchase, moveStage } from "@/features/stork/lib/purchases";

export type OrderStageFailure =
  | "not-authorized"
  | "invalid-input"
  | "not-found"
  | "not-allowed"
  | "stale"
  | "server-error";

export type OrderStageResult =
  | { status: "success" }
  | { status: "error"; reason: OrderStageFailure };

const idSchema = z.uuid();

/**
 * Moves a purchase one step on, or one back.
 *
 * The move is checked against the order as it is stored right now, not as the
 * page rendered it: `expected` is what the founder was looking at, and a
 * mismatch is reported as stale rather than applied.
 */
export async function setOrderStage(
  id: string,
  expected: OrderStage,
  next: OrderStage,
): Promise<OrderStageResult> {
  // A server action is a public endpoint: the page's guard does not cover it.
  const access = await resolveAdminAccess();
  if (access.status !== "ok") {
    return { status: "error", reason: "not-authorized" };
  }

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success || !isOrderStage(expected) || !isOrderStage(next)) {
    return { status: "error", reason: "invalid-input" };
  }

  const purchase = await getPurchase(parsedId.data);
  if (!purchase) return { status: "error", reason: "not-found" };
  if (stageOf(purchase.status, purchase.productionStage) !== expected) {
    return { status: "error", reason: "stale" };
  }
  if (!canMoveStage(expected, next)) {
    return { status: "error", reason: "not-allowed" };
  }

  if (!(await moveStage(purchase, expected, next))) {
    return { status: "error", reason: "server-error" };
  }

  revalidatePath(storkPath);
  return { status: "success" };
}
