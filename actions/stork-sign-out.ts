"use server";

import { redirect } from "next/navigation";

import { storkPath } from "@/features/admin/lib/admin-routes";
import { createClient } from "@/lib/supabase/server";

export async function signOutStork(): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) console.error("[STORK_SIGN_OUT]", error.message);
  } catch (error) {
    console.error("[STORK_SIGN_OUT]", error);
  }

  redirect(storkPath);
}
