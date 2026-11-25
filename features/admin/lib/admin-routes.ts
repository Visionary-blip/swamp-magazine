// One list of admin paths so the proxy, the guard, the nav, and the redirects
// can never drift apart -- a typo in any one of them is either a lockout or an
// open door. Pure constants on purpose: the proxy imports this, so it must not
// pull `server-only` or env into the request path.

export const adminRoutes = {
  dashboard: "/admin",
  signIn: "/admin/sign-in",
  callback: "/admin/auth/callback",
  signOut: "/admin/auth/sign-out",
  subscribers: "/admin/subscribers",
  subscribersExport: "/admin/subscribers/export",
  products: "/admin/products",
  slots: "/admin/slots",
  orders: "/admin/orders",
} as const;

// Stork, the founder's purchase log, is its own page behind the same sign-in.
export const storkPath = "/stork";
// Remembers that a Google round trip started at Stork. A cookie rather than a
// query on the callback URL, which Supabase only honours if it is on the
// project's list of redirect URLs.
export const storkReturnCookie = "sign-in-to-stork";

// Reachable while signed out. The Google round trip dies if the callback is
// behind the same redirect as everything else.
export const publicAdminPrefixes = [adminRoutes.signIn, "/admin/auth"] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return publicAdminPrefixes.some((prefix) => pathname.startsWith(prefix));
}
