import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutScreen } from "@/features/checkout";
import { getAddOns } from "@/features/storefront";
import { isAtOrderCapacity } from "@/lib/order-capacity.server";
import { getSiteMode } from "@/lib/site-mode.server";

// Same gate as the product pages: an unreleased drop must not be reachable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CART — SWAMP MAGAZINE",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const mode = await getSiteMode();
  if (mode !== "live" || (await isAtOrderCapacity())) redirect("/");
  return <CheckoutScreen addOns={await getAddOns()} />;
}
