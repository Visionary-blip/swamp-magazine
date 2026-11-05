import type { Metadata } from "next";

import { PolicyScreen, shippingReturnsCopy } from "@/features/storefront";

export const metadata: Metadata = {
  title: "SHIPPING & RETURNS — SWAMP MAGAZINE",
};

// Like "/" this route has no site-mode gate: it leaks nothing about an unreleased
// drop, and a footer link that redirects to the storefront reads as broken.
export default function ShippingPage() {
  return (
    <PolicyScreen
      title="SHIPPING & RETURNS"
      sections={shippingReturnsCopy.sections}
      email={shippingReturnsCopy.email}
    />
  );
}
