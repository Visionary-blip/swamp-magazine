import { dials } from "@/config/dials";
import { formatUsd } from "@/lib/money";

export type PolicyFact = {
  /** The figure, set large: "14 DAYS", "$5". */
  value: string;
  label: string;
};

export type PolicySection = {
  heading: string;
  /** The numbers that matter, big, ahead of the lines. */
  facts?: PolicyFact[];
  bullets?: string[];
};

// INVENTED wording, drafted for the founder (docs/drafts/shipping-and-returns-policy.md)
// from how the shop is built: free campus pickup, the flat shipping dial, refund
// on oversell. The founder confirmed the terms: 14-day returns, buyer pays return
// shipping, 3-5 day processing, pickup at Sadler Terrace, US-only for now, no
// exchanges for now. The refund time (5-10 days) and the 7-day damaged-item window
// are still my defaults. Not legal advice.
//
// The shipping rate is read from the dial so this page can never disagree with
// what checkout charges.
export const shippingReturnsCopy: { email: string; sections: PolicySection[] } =
  {
    email: dials.contactEmail,
    sections: [
      {
        heading: "Shipping",
        facts: [
          { value: "FREE", label: "Campus pickup, Sadler Terrace" },
          {
            value: formatUsd(dials.shippingFlatRateCents),
            label: "Flat shipping, US only",
          },
          { value: "3–5 DAYS", label: "To pack and ship" },
          { value: "2–5 DAYS", label: "Delivery" },
        ],
        bullets: [
          "Pickup: we email you when your order is ready.",
          "Shipping: tracking comes by email once it goes out.",
          "Check your address. If a package comes back because of it, we re-send at your cost.",
          "Stock is limited. If a size sells out while you pay, you are refunded in full.",
        ],
      },
      {
        heading: "Returns",
        facts: [
          { value: "14 DAYS", label: "To return" },
          { value: "5–10 DAYS", label: "To refund" },
        ],
        bullets: [
          "Unworn, unwashed, tags on.",
          "Email us first and we will say where to send it.",
          "You pay return shipping. The original shipping is not refunded.",
          "Pickup orders can be returned in person.",
          "No exchanges right now.",
          "Add-ons cannot be returned.",
        ],
      },
      {
        heading: "Wrong or damaged",
        facts: [{ value: "7 DAYS", label: "To tell us" }],
        bullets: [
          "Email a photo. We replace it or refund you, and cover the shipping.",
        ],
      },
      {
        heading: "Cancel",
        bullets: [
          "Email us before it ships and we will cancel and refund you.",
        ],
      },
    ],
  };
