"use server";

import { subscribeSchema } from "@/features/coming-soon/lib/subscribe-schema";
import { addSubscriber } from "@/lib/subscribe.server";

export type SubscribeFromCheckoutResult =
  | { status: "success" }
  | { status: "error"; reason: "invalid-email" | "server-error" };

// The FINGER ON THE PULSE button under the payment fields: pressing it is the
// newsletter opt-in, using the email the buyer already typed for the order.
// A plain argument rather than FormData, but it still crosses the network, so
// it is validated exactly like the coming-soon form's email.
export async function subscribeFromCheckout(
  email: string,
): Promise<SubscribeFromCheckoutResult> {
  const parsed = subscribeSchema.shape.email.safeParse(email);
  if (!parsed.success) return { status: "error", reason: "invalid-email" };

  const result = await addSubscriber(parsed.data);
  return result === "ok"
    ? { status: "success" }
    : { status: "error", reason: "server-error" };
}
