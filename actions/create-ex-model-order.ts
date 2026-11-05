"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { z } from "zod";

import { adminRoutes } from "@/features/admin/lib/admin-routes";
import { resolveOrderDraft, type ProductRow } from "@/lib/checkout/order-draft";
import { serverEnv } from "@/lib/env/server";
import { isAtOrderCapacity } from "@/lib/order-capacity.server";
import { getSiteMode } from "@/lib/site-mode.server";
import { createAdminClient } from "@/lib/supabase/admin";

import type { DeliveryMethod } from "./create-checkout-session";

// The EX-MODEL order: a former model places the order they built without
// paying. Everything else is the paid path's -- prices and stock read from the
// DB here, the same draft rules (an add-on never rides alone) -- but the order
// lands as paid for 0 and the founder is emailed what was asked for. There is no
// password; the button hides itself in the browser once it has been used.

export type CreateExModelOrderInput = {
  items: { slug: string; size: string; quantity: number }[];
  delivery: DeliveryMethod;
  name: string;
  email: string;
};

export type CreateExModelOrderResult =
  | { status: "success" }
  | {
      status: "error";
      reason:
        | "invalid-input"
        | "not-found"
        | "sold-out"
        | "at-capacity"
        | "server-error";
    };

const inputSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(200),
        size: z.string().min(1).max(20),
        quantity: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
  delivery: z.enum(["pickup", "shipping"]),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
});

const PRODUCT_SELECT =
  "id, slug, name, price_cents, active, is_add_on, product_variants(id, size, inventory_count)";
const LEGACY_PRODUCT_SELECT =
  "id, slug, name, price_cents, active, product_variants(id, size, inventory_count)";

export async function createExModelOrder(
  input: CreateExModelOrderInput,
): Promise<CreateExModelOrderResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { status: "error", reason: "invalid-input" };
  const { items, delivery, name, email } = parsed.data;

  // Same gates as the paid path: an unreleased drop is not reachable by id.
  if ((await getSiteMode()) !== "live") {
    return { status: "error", reason: "not-found" };
  }
  if (await isAtOrderCapacity()) {
    return { status: "error", reason: "at-capacity" };
  }

  try {
    const supabase = createAdminClient();
    const slugs = [...new Set(items.map((item) => item.slug))];
    const first = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("slug", slugs);
    const result =
      first.error?.code === "42703"
        ? await supabase
            .from("products")
            .select(LEGACY_PRODUCT_SELECT)
            .in("slug", slugs)
        : first;
    if (result.error) {
      console.error("[EX_MODEL]", result.error.code, result.error.message);
      return { status: "error", reason: "server-error" };
    }
    const products = (result.data ?? []) as ProductRow[];

    const drafted = resolveOrderDraft(products, items, delivery);
    if (drafted.status === "error") {
      return {
        status: "error",
        reason:
          drafted.reason === "sold-out" || drafted.reason === "not-found"
            ? drafted.reason
            : "invalid-input",
      };
    }
    const { draft } = drafted;

    // "Paid" for nothing: it is the status the admin list and the capacity
    // count work from, and the name carries the marker so it reads as what it is.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "paid",
        delivery_method: draft.delivery,
        customer_name: `${name} (EX-MODEL)`,
        customer_email: email,
        amount_total_cents: 0,
        expected_amount_cents: 0,
      })
      .select("id")
      .single();
    if (orderError || !order) {
      console.error("[EX_MODEL]", orderError?.code, orderError?.message);
      return { status: "error", reason: "server-error" };
    }
    const orderId = order.id as string;

    const { error: itemError } = await supabase.from("order_items").insert(
      draft.lines.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        variant_id: line.variantId,
        product_name: line.productName,
        size: line.size,
        unit_price_cents: line.unitPriceCents,
        quantity: line.quantity,
      })),
    );
    if (itemError) {
      console.error("[EX_MODEL]", itemError.code, itemError.message);
      await supabase
        .from("orders")
        .update({ status: "canceled" })
        .eq("id", orderId);
      return { status: "error", reason: "server-error" };
    }

    // Stock leaves the shelf like any sale. The update only lands if the count
    // is still what was read a moment ago, so two orders cannot both take the
    // last one.
    for (const line of draft.lines) {
      if (!line.variantId) continue;
      const current = products
        .flatMap((row) => row.product_variants)
        .find((variant) => variant.id === line.variantId)?.inventory_count;
      if (current === undefined) continue;
      const { data: updated, error: stockError } = await supabase
        .from("product_variants")
        .update({ inventory_count: current - line.quantity })
        .eq("id", line.variantId)
        .eq("inventory_count", current)
        .select("id");
      if (stockError || !updated || updated.length === 0) {
        console.error("[EX_MODEL] stock", orderId, stockError?.message);
        await supabase
          .from("orders")
          .update({ status: "canceled" })
          .eq("id", orderId);
        return { status: "error", reason: "sold-out" };
      }
    }

    await notifyFounder({
      orderId,
      name,
      email,
      delivery: draft.delivery,
      lines: draft.lines.map(
        (line) =>
          `${line.productName} ${line.size}${line.quantity > 1 ? ` x${line.quantity}` : ""}`,
      ),
    });

    revalidatePath(adminRoutes.orders);
    return { status: "success" };
  } catch (error) {
    console.error("[EX_MODEL]", error);
    return { status: "error", reason: "server-error" };
  }
}

// Not fatal if it fails: the order is already in the admin list.
async function notifyFounder(order: {
  orderId: string;
  name: string;
  email: string;
  delivery: DeliveryMethod;
  lines: string[];
}) {
  if (serverEnv.adminEmails.length === 0) {
    console.error("[EX_MODEL] no ADMIN_EMAILS to notify", order.orderId);
    return;
  }
  try {
    const resend = new Resend(serverEnv.resendApiKey);
    const { error } = await resend.emails.send({
      from: serverEnv.resendFrom,
      to: serverEnv.adminEmails,
      subject: `EX-MODEL ORDER: ${order.lines.join(", ")}`,
      text: [
        "An EX-MODEL placed an order without paying.",
        "",
        ...order.lines.map((line) => `  ${line}`),
        "",
        `Name: ${order.name}`,
        `Email: ${order.email}`,
        `Delivery: ${order.delivery}`,
        `Order: ${order.orderId}`,
      ].join("\n"),
    });
    if (error) console.error("[EX_MODEL] email", order.orderId, error);
  } catch (error) {
    console.error("[EX_MODEL] email", order.orderId, error);
  }
}
