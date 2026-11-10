import "server-only";

import type { SiteMode } from "@/lib/site-mode";
import { getSiteMode } from "@/lib/site-mode.server";

import { resolveAdminAccess } from "./admin-guard";

/**
 * The mode the storefront pages render in for THIS visitor. While the site is
 * closed to customers (coming_soon), a signed-in admin on the allowlist sees the
 * live storefront as a preview; everyone else still gets the coming-soon page.
 *
 * Only the pages read this. Anything that takes an order (the checkout actions)
 * keeps asking `getSiteMode` directly, so a closed site cannot be bought from,
 * preview or not.
 */
export async function getStorefrontMode(): Promise<SiteMode> {
  const mode = await getSiteMode();
  if (mode === "live") return mode;
  return (await resolveAdminAccess()).status === "ok" ? "live" : mode;
}
