import "server-only";

import { dials } from "@/config/dials";
import { createAdminClient } from "@/lib/supabase/admin";

// Orders that hold a slot. Pending ones do not (abandoned carts would close the
// shop on nobody's money); refunded and canceled ones give the slot back.
const COUNTED_STATUSES = ["paid", "fulfilled", "picked_up"];

// Fails open: a read error must not shut the shop on a transient blip, and the
// checkout action still sells nothing it cannot fulfil from stock.
export async function isAtOrderCapacity(): Promise<boolean> {
  try {
    const { count, error } = await createAdminClient()
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", COUNTED_STATUSES);

    if (error) {
      console.error("[CAPACITY]", error.code, error.message);
      return false;
    }
    return (count ?? 0) >= dials.orderCapacity;
  } catch (error) {
    console.error("[CAPACITY]", error);
    return false;
  }
}
