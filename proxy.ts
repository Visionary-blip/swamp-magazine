import type { NextRequest } from "next/server";

import { updateAdminSession } from "@/lib/supabase/proxy";

// Next 16 renamed the `middleware` file convention to `proxy`; `middleware.ts`
// still runs but warns on every build, so the new name is used here.
export async function proxy(request: NextRequest) {
  return updateAdminSession(request);
}

export const config = {
  // /admin always. The storefront pages are listed too, but only so a signed-in
  // admin's session is refreshed there (they preview the closed site); a visitor
  // with no session cookie is passed straight through without any Supabase call.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/",
    "/product/:path*",
    "/checkout",
    "/add-ons",
    "/stork",
  ],
};
