import type { DeliveryMethod } from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";

import { formatUsd, orderCopy } from "./order-copy";

// The two ways to receive an order, as the product page and the cart page both
// offer them.
export const deliveryOptions: {
  value: DeliveryMethod;
  label: string;
  price: string;
}[] = [
  { value: "pickup", label: orderCopy.pickup, price: orderCopy.free },
  {
    value: "shipping",
    label: orderCopy.shipping,
    // The rate is the dial's, never a literal -- change it in config/dials.ts
    // and this line and the Stripe shipping option move together.
    price: formatUsd(dials.shippingFlatRateCents),
  },
];
