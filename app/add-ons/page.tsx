import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AddOnsScreen } from "@/features/checkout";
import { getAddOns } from "@/features/storefront";
import { isAtOrderCapacity } from "@/lib/order-capacity.server";
import { getSiteMode } from "@/lib/site-mode.server";

// Same gate as the cart page: an unreleased drop must not be reachable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ADD-ONS — SWAMP MAGAZINE",
  robots: { index: false, follow: false },
};

export default async function AddOnsPage() {
  const mode = await getSiteMode();
  if (mode !== "live" || (await isAtOrderCapacity())) redirect("/");
  const addOns = await getAddOns();
  // Nothing to offer means the step does not exist: straight on to the cart.
  if (addOns.length === 0) redirect("/checkout");
  return <AddOnsScreen addOns={addOns} />;
}
