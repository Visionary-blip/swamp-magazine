"use client";

import { useState, useTransition, type FormEvent } from "react";

import {
  createCheckoutSession,
  type DeliveryMethod,
} from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";
import { cn } from "@/lib/utils";

import { PaymentStation } from "../payment-station/payment-station";
import {
  formatUsd,
  orderCopy,
  orderErrorLines,
  type OrderErrorReason,
} from "../../lib/order-copy";
import { stripePromise } from "../../lib/stripe-client";

/** Structurally the storefront's `ProductVariant`, declared here so the order
 * form doesn't depend on the catalog lane's file. */
export type CheckoutVariant = { size: string; soldOut: boolean };

export type CheckoutFormProps = {
  slug: string;
  name: string;
  priceCents: number;
  variants: CheckoutVariant[];
};

const deliveryOptions: {
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

// The poster's bottom block (the founder's order mockups): red Helvetica set
// straight onto the shoot, centred like the YZY store, reading top to bottom as
// size, delivery, place order. Same flow and states as before; only the
// placement changed. Every line is the same size -- `brat` owns it. Red is the
// ink, yellow is "this one is live", and the card step sits on a solid panel
// because Stripe's fields need a flat ground.
export function CheckoutForm({
  slug,
  name,
  priceCents,
  variants,
}: CheckoutFormProps) {
  const [size, setSize] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<OrderErrorReason | null>(null);
  // Sizes the server refused after this page rendered. Stock is the DB's word,
  // never the client's, so a "sold-out" answer has to beat the snapshot this
  // component was handed.
  const [refusedSizes, setRefusedSizes] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const sizes = variants.map((variant) => ({
    size: variant.size,
    soldOut: variant.soldOut || refusedSizes.includes(variant.size),
  }));
  const allGone = sizes.length === 0 || sizes.every((option) => option.soldOut);

  const shippingCents =
    delivery === "shipping" ? dials.shippingFlatRateCents : 0;
  const totalCents = priceCents + shippingCents;
  const deliveryLabel =
    delivery === "shipping" ? orderCopy.shipping : orderCopy.pickup;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The button is already disabled in both cases; pressing Enter inside the
    // form submits anyway, which is where a double order would come from.
    if (!size || isPending) return;
    setErrorReason(null);
    startTransition(async () => {
      const result = await createCheckoutSession({ slug, size, delivery });
      if (result.status === "success") {
        setClientSecret(result.clientSecret);
        setOrderId(result.orderId);
        return;
      }
      setErrorReason(result.reason);
      if (result.reason === "sold-out") {
        setRefusedSizes((current) => [...current, size]);
        setSize(null);
      }
    });
  }

  // Dropping the secret is all it takes to get back to the size row: nothing is
  // charged until confirm, so the abandoned session and its pending order are
  // exactly what closing the tab would have left behind. The alternative -- no
  // way back at all -- made a mis-picked size a page reload.
  function handleChangeSize() {
    setClientSecret(null);
    setOrderId(null);
    setErrorReason(null);
  }

  if (!stripePromise || errorReason === "stripe-unconfigured") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        {/* The sizes stay on the page when ordering is not armed yet: dropping
            them would take the row the mockups are built around off the
            product screen, so an un-keyed deploy would read as broken rather
            than as not open yet. */}
        <h1 className="brat text-brand-red">{name}</h1>
        <ul className="brat flex flex-wrap justify-center gap-x-8 text-brand-red">
          {sizes.map((option) => (
            <li
              key={option.size}
              className={option.soldOut ? "line-through opacity-40" : ""}
            >
              {option.size}
              {option.soldOut ? (
                <span className="sr-only"> sold out</span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="brat text-brand-red">{formatUsd(priceCents)}</p>
        <p className="brat text-brand-red">
          {orderErrorLines["stripe-unconfigured"]}
        </p>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div className="mx-auto w-full max-w-md bg-ink/95 p-6">
        <PaymentStation
          clientSecret={clientSecret}
          orderId={orderId}
          name={name}
          size={size}
          priceCents={priceCents}
          delivery={delivery}
          deliveryLabel={deliveryLabel}
          shippingCents={shippingCents}
          totalCents={totalCents}
          onChangeSize={handleChangeSize}
        />
      </div>
    );
  }

  // `stripe-unconfigured` already returned above, so every reason that reaches
  // here is one the buyer can act on.
  const errorLine = errorReason ? orderErrorLines[errorReason] : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-3 text-center"
    >
      <h1 className="brat text-brand-red">{name}</h1>

      <fieldset disabled={isPending}>
        <legend className="sr-only">{orderCopy.size}</legend>
        <div className="brat flex flex-wrap justify-center gap-x-8">
          {sizes.map((option) => (
            <label
              key={option.size}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                option.soldOut
                  ? "cursor-not-allowed text-brand-red line-through opacity-40"
                  : size === option.size
                    ? "text-brand-yellow"
                    : "text-brand-red hover:text-brand-yellow",
              )}
            >
              <input
                type="radio"
                name="size"
                value={option.size}
                checked={size === option.size}
                disabled={option.soldOut}
                onChange={() => setSize(option.size)}
                className="peer sr-only"
              />
              <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                {option.size}
                {/* The strike-through is the sighted cue; disabled alone does
                    not say why, so screen readers get the reason. */}
                {option.soldOut ? (
                  <span className="sr-only"> sold out</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={isPending}>
        <legend className="sr-only">DELIVERY</legend>
        <div className="brat flex flex-wrap justify-center gap-x-8">
          {deliveryOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                delivery === option.value
                  ? "text-brand-yellow"
                  : "text-brand-red hover:text-brand-yellow",
              )}
            >
              <input
                type="radio"
                name="delivery"
                value={option.value}
                checked={delivery === option.value}
                onChange={() => setDelivery(option.value)}
                className="peer sr-only"
              />
              <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                {option.label} {option.price}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {errorLine ? (
        <p role="alert" className="brat text-brand-red">
          {errorLine}
        </p>
      ) : null}

      {allGone ? (
        <p className="brat text-brand-red">{orderCopy.soldOut}</p>
      ) : (
        <>
          {!size && !errorLine ? (
            <p className="brat text-brand-red opacity-80">
              {orderCopy.pickSize}
            </p>
          ) : null}
          {/* The total rides the button: the ledger that used to state it is
              gone from this step, and nobody should learn the real charge
              inside the card fields. */}
          <button
            type="submit"
            disabled={isPending || !size}
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending
              ? orderCopy.submitPending
              : `${orderCopy.next} ${formatUsd(totalCents)}`}
          </button>
        </>
      )}
    </form>
  );
}
