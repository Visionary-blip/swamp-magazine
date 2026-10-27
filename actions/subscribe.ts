"use server";

import { subscribeSchema } from "@/features/coming-soon/lib/subscribe-schema";
import { addSubscriber } from "@/lib/subscribe.server";

export type SubscribeFailure =
  "invalid-email" | "invalid-phone" | "server-error";

export type SubscribeState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; reason: SubscribeFailure };

export async function subscribeToDrop(
  _previous: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      reason: field === "phone" ? "invalid-phone" : "invalid-email",
    };
  }

  const { email, phone } = parsed.data;
  const result = await addSubscriber(email, phone ?? null);
  return result === "ok"
    ? { status: "success" }
    : { status: "error", reason: "server-error" };
}
