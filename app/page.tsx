import { getStorefrontMode } from "@/features/admin";
import { ComingSoonScreen } from "@/features/coming-soon";
import { CapacityScreen, LiveLandingScreen } from "@/features/storefront";
import { isAtOrderCapacity } from "@/lib/order-capacity.server";

// The mode gate reads site_settings on every request so a flip in the admin
// (or Studio) changes "/" without a redeploy. /admin sits outside this gate.
// A signed-in admin sees the live storefront while it is closed (a preview).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const mode = await getStorefrontMode();
  if (mode !== "live") return <ComingSoonScreen />;
  // Closes the whole storefront once the order cap is hit; /order and /admin
  // stay reachable so paid buyers and the founder are unaffected.
  if (await isAtOrderCapacity()) return <CapacityScreen />;
  return <LiveLandingScreen />;
}
