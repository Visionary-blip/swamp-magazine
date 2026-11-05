import "server-only";

import { Resend } from "resend";

import { SubscribeConfirmationEmail } from "@/emails/subscribe-confirmation";
import { serverEnv } from "@/lib/env/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DUPLICATE_KEY_VIOLATION = "23505";

// The one place a subscriber row is written, shared by the coming-soon form and
// the checkout's FINGER ON THE PULSE button so both opt-ins behave identically.
// `email` must already be validated and lower-cased by the caller.
export async function addSubscriber(
  email: string,
  phone: string | null = null,
): Promise<"ok" | "error"> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("subscribers").insert({
      email,
      phone,
      email_consent: true,
      // Leaving a number under the form's disclosure line is the SMS opt-in
      // (D4); sends still wait for A2P registration.
      sms_consent: phone != null,
    });

    if (error) {
      // Re-signup reads as success to the visitor; no second confirmation
      // email, so the endpoint can't be used to spam an inbox.
      if (error.code === DUPLICATE_KEY_VIOLATION) return "ok";
      console.error("[SUBSCRIBE]", error.code, error.message);
      return "error";
    }

    // The row is what matters; a failed confirmation email logs loudly but
    // does not undo the signup.
    await sendConfirmationEmail(email);
    return "ok";
  } catch (error) {
    console.error("[SUBSCRIBE]", error);
    return "error";
  }
}

async function sendConfirmationEmail(email: string) {
  try {
    const resend = new Resend(serverEnv.resendApiKey);
    const { error } = await resend.emails.send({
      from: serverEnv.resendFrom,
      to: email,
      subject: "SWAMP MAGAZINE: FINGER ON THE PULSE",
      react: SubscribeConfirmationEmail(),
    });
    if (error) {
      console.error("[SUBSCRIBE_EMAIL]", error);
    }
  } catch (error) {
    console.error("[SUBSCRIBE_EMAIL]", error);
  }
}
