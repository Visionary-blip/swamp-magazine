"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { hasAdminAllowlist } from "@/features/admin/lib/admin-allowlist";
import {
  adminRoutes,
  storkReturnCookie,
} from "@/features/admin/lib/admin-routes";
import { createClient } from "@/lib/supabase/server";

export type AdminSignInFailure = "no-allowlist" | "google-unreachable";

export type AdminSignInState =
  { status: "idle" } | { status: "error"; reason: AdminSignInFailure };

/**
 * Hands the browser to Google. Authorizes nobody.
 *
 * Google settles *who* you are; `ADMIN_EMAILS` settles whether that identity
 * gets in, and that check runs on the verified JWT claim -- in the callback,
 * and again on every guarded render. Nothing here is a gate.
 *
 * The magic link this replaced could refuse an off-list address before
 * Supabase was ever touched, because the address arrived in the form. An OAuth
 * identity does not exist until Google returns it, so a stranger who finds
 * this page mints an `auth.users` row and is then denied and signed out at the
 * callback. That row is litter, not access. What is still knowable up front is
 * an empty allowlist, and it is worth catching: a round trip that can only end
 * in a denial is a worse error message than saying so on the page.
 *
 * Runs as a server action rather than a link because the PKCE verifier is a
 * cookie, and only an action (or a route handler) can write one. The one thing
 * the form says is where to come back to: the admin, or Stork.
 */
export async function startAdminGoogleSignIn(
  _state: AdminSignInState,
  formData: FormData,
): Promise<AdminSignInState> {
  if (!hasAdminAllowlist()) {
    return { status: "error", reason: "no-allowlist" };
  }

  const cookieStore = await cookies();
  if (formData.get("destination") === "stork") {
    cookieStore.set(storkReturnCookie, "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  } else {
    cookieStore.delete(storkReturnCookie);
  }

  let consentScreen: string;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Safe against a spoofed Host header: Supabase only honours redirect
        // targets that match the project's configured Redirect URLs, and falls
        // back to the Site URL otherwise.
        redirectTo: `${await resolveOrigin()}${adminRoutes.callback}`,
        // Both admins sign into personal Google accounts on shared devices.
        // Without this, Google reuses whichever account is already live and
        // the wrong one silently lands on the denial screen.
        queryParams: { prompt: "select_account" },
      },
    });

    if (error || !data.url) {
      console.error("[ADMIN_SIGN_IN]", error?.status, error?.message);
      return { status: "error", reason: "google-unreachable" };
    }

    consentScreen = data.url;
  } catch (error) {
    console.error("[ADMIN_SIGN_IN]", error);
    return { status: "error", reason: "google-unreachable" };
  }

  // Outside the try: `redirect` signals by throwing.
  redirect(consentScreen);
}

async function resolveOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  return `${protocol}://${host}`;
}
