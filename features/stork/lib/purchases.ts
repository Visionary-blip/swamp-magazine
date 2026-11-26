import "server-only";

import {
  handoverStatusFor,
  isDeliveryMethod,
  isOrderStatus,
  type DeliveryMethod,
  type OrderStatus,
} from "@/features/admin/lib/order-status";
import { moveOrderStatus } from "@/features/admin/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

import {
  isProductionStage,
  type OrderStage,
  type ProductionStage,
} from "./order-stage";

export type Purchase = {
  id: string;
  status: OrderStatus;
  productionStage: ProductionStage | null;
  deliveryMethod: DeliveryMethod;
  customerName: string | null;
  customerEmail: string | null;
  /** The address on one line, for a shipped order. */
  shipTo: string | null;
  amountCents: number | null;
  createdAt: string;
  items: { id: string; name: string; size: string; quantity: number }[];
};

export type PurchaseLog = {
  purchases: Purchase[];
  /** False until the production_stage migration has been run. */
  stagesReady: boolean;
};

const SELECT =
  "id, status, delivery_method, customer_name, customer_email, shipping_address, amount_total_cents, created_at, order_items(id, product_name, size, quantity)";
const STAGED_SELECT =
  "id, status, production_stage, delivery_method, customer_name, customer_email, shipping_address, amount_total_cents, created_at, order_items(id, product_name, size, quantity)";

// Postgres "undefined column": the production_stage migration has not been run.
// The log still has to load, so it is read without the column.
const MISSING_COLUMN = "42703";

const LIST_LIMIT = 200;

// Test orders from before and during launch, kept out of the log at the
// founder's request. Hidden, not deleted: they are still in the database and
// the admin. Remove an id to bring that order back.
const HIDDEN_ORDER_IDS = new Set([
  "19cdc7c1-05b9-46a2-91d8-83f14836b1a1",
  "434b96da-6eb5-46ba-b44c-eef1e9ae34e4",
  "acb8a677-30e5-4598-b658-dc65b211374f",
  "87fea8ea-deec-4f22-8485-fac2b928e41d",
  "5bb64175-77b1-40fb-905e-058a2b03da6c",
]);

type Row = {
  id: string;
  status: string;
  production_stage?: string | null;
  delivery_method: string;
  customer_name: string | null;
  customer_email: string | null;
  shipping_address: unknown;
  amount_total_cents: number | null;
  created_at: string;
  order_items:
    | { id: string; product_name: string; size: string; quantity: number }[]
    | null;
};

/** `null` means the read failed -- never an empty list, which reads as "no sales". */
export async function getPurchaseLog(): Promise<PurchaseLog | null> {
  try {
    const supabase = createAdminClient();
    // A log of payments, so abandoned checkouts (pending) stay out.
    const read = (select: string) =>
      supabase
        .from("orders")
        .select(select)
        .neq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(LIST_LIMIT);

    const staged = await read(STAGED_SELECT);
    const stagesReady = staged.error?.code !== MISSING_COLUMN;
    const { data, error } = stagesReady ? staged : await read(SELECT);
    if (error) {
      console.error("[STORK_LOG]", error.code, error.message);
      return null;
    }

    return {
      purchases: ((data ?? []) as unknown as Row[])
        .filter((row) => !HIDDEN_ORDER_IDS.has(row.id))
        .map(toPurchase),
      stagesReady,
    };
  } catch (error) {
    console.error("[STORK_LOG]", error);
    return null;
  }
}

export async function getPurchase(id: string): Promise<Purchase | null> {
  try {
    const { data, error } = await createAdminClient()
      .from("orders")
      .select(STAGED_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[STORK_PURCHASE]", error.code, error.message);
      return null;
    }
    return data ? toPurchase(data as unknown as Row) : null;
  } catch (error) {
    console.error("[STORK_PURCHASE]", error);
    return null;
  }
}

/**
 * Writes one stage move. Delivering (and undoing it) is a status change; the
 * steps before it only touch production_stage, guarded on what it was so a
 * double tap cannot apply twice.
 */
export async function moveStage(
  purchase: Purchase,
  from: OrderStage,
  to: OrderStage,
): Promise<boolean> {
  if (to === "delivered") {
    const handover = handoverStatusFor(purchase.deliveryMethod);
    return moveOrderStatus(purchase.id, "paid", handover);
  }
  if (from === "delivered") {
    return moveOrderStatus(purchase.id, purchase.status, "paid");
  }

  try {
    const update = createAdminClient()
      .from("orders")
      .update({
        production_stage: to === "to_do" ? null : to,
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.id)
      .eq("status", "paid");
    const { data, error } = await (
      from === "to_do"
        ? update.is("production_stage", null)
        : update.eq("production_stage", from)
    ).select("id");

    if (error) {
      console.error("[STORK_STAGE]", error.code, error.message);
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error("[STORK_STAGE]", error);
    return false;
  }
}

function toPurchase(row: Row): Purchase {
  const deliveryMethod = isDeliveryMethod(row.delivery_method)
    ? row.delivery_method
    : "pickup";
  return {
    id: row.id,
    status: isOrderStatus(row.status) ? row.status : "pending",
    productionStage: isProductionStage(row.production_stage)
      ? row.production_stage
      : null,
    deliveryMethod,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    shipTo:
      deliveryMethod === "shipping" ? toAddressLine(row.shipping_address) : null,
    amountCents: row.amount_total_cents,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      name: item.product_name,
      size: item.size,
      quantity: item.quantity,
    })),
  };
}

// Stripe stores either the address itself or `{ name, address }`.
function toAddressLine(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const outer = value as Record<string, unknown>;
  const source = (
    outer.address && typeof outer.address === "object" ? outer.address : outer
  ) as Record<string, unknown>;
  const line = [
    outer.name,
    source.line1,
    source.line2,
    source.city,
    source.state,
    source.postal_code,
  ]
    .filter((part): part is string => typeof part === "string" && part !== "")
    .join(", ");
  return line || null;
}
