// The dial registry (PLAN.md par.3 / DESIGN.md par.5), defined once. Every tunable
// product number lives here with its provisional default -- changing one is
// config, not surgery, and copy interpolates from these values rather than
// hardcoding them. None of these defaults is a ratified product decision.

export const dials = {
  /**
   * Flat shipping rate in cents, charged when delivery_method is "shipping".
   * Founder's call; wired into Stripe shipping_options in P3.
   */
  shippingFlatRateCents: 500,

  /**
   * Oversell policy: stock is checked at checkout-session creation; if a
   * webhook race oversells anyway, the remedy is refund + apologize (real
   * reservation is overkill at this scale). Implemented in P3.
   */
  oversellPolicy: "refund_and_apologize" as const,

  /**
   * Paid orders after which the storefront closes itself and shows "order
   * capacity reached". The founder can only fulfil so many by hand per drop.
   * Counts orders (not garments) in paid / fulfilled / picked_up; refunded and
   * canceled ones free their slot. Checked when a session is created, so a few
   * buyers already mid-payment at the 20th can still land a 21st -- acceptable
   * at this scale, same spirit as `oversellPolicy`.
   */
  orderCapacity: 20,

  /**
   * SMS sends stay off until A2P 10DLC registration clears (D4). The subscribe
   * form collects phone + consent from day one either way.
   */
  smsEnabled: false,

  /**
   * Manual Venmo path (O2-C) was offered and not selected -- launch is
   * Stripe-only (D2). Kept as a dial in case the founder asks later.
   */
  venmoEnabled: false,

  /**
   * VA sales tax is a business question for the founder, outside the codebase;
   * ships off (DESIGN.md par.5).
   */
  stripeTaxEnabled: false,

  /**
   * Recipients per Resend batch call in the drop announcement (P5). 100 is
   * Resend's hard ceiling for `batch.send`, not a preference -- lower it only
   * to make a send gentler on a shared account.
   */
  announcementBatchSize: 100,

  /**
   * Pause between announcement batches, in milliseconds. Resend's default
   * account limit is 2 requests/second; ~600 ms keeps a long send under it even
   * when a call returns instantly, at the cost of ~6 s per 1000 subscribers.
   */
  announcementBatchPauseMs: 600,

  /**
   * Longest edge, in pixels, of an image uploaded through the admin's slot
   * manager. BD-6's ceiling: everything reaching a page is a resized WebP, and
   * the founder's masters are 3-5 MB phone photos that would kill LCP raw.
   * Matches the seed script's constant -- change both together.
   */
  slotImageMaxDimensionPx: 2000,

  /**
   * WebP quality for those uploads. 82 is the seed's setting; below ~75 the
   * cutouts band visibly against the cream background.
   */
  slotImageWebpQuality: 82,

  /**
   * Largest file the slot uploader accepts, in bytes. Generous enough for a
   * phone master (3-5 MB) with headroom, small enough that a mis-picked video
   * fails fast instead of occupying a server action for a minute.
   */
  slotImageMaxUploadBytes: 20 * 1024 * 1024,

  /**
   * Largest selfie the "I want to model" form accepts, in bytes. Phone
   * selfies run 2-5 MB; this stays under the server-action body limit that
   * next.config derives from `slotImageMaxUploadBytes`.
   */
  modelSelfieMaxUploadBytes: 10 * 1024 * 1024,

  /**
   * Largest piece of work a creative can attach on the "get me involved" form,
   * in bytes. Same ceiling as the selfie, under the server-action body limit.
   */
  creativeWorkMaxUploadBytes: 10 * 1024 * 1024,

  /**
   * Canonical public origin (swampmagazine.com, purchased per DESIGN.md par.2).
   * Deliberately not env-driven: absolute URLs are needed where no request
   * exists to derive a host from -- unsubscribe links inside email, the
   * sitemap, OG tags -- and app code never reads `process.env`. DNS is not
   * pointed here yet (P5 cutover); this is the one line to change if the
   * founder lands on a different domain.
   */
  canonicalSiteUrl: "https://swampmagazine.com",

  /**
   * Instagram handles, without the "@": the founder's personal account and the
   * magazine's. Confirmed by Zach 2026-09-21, replacing the placeholders this
   * shipped with. The footer links straight at instagram.com/<handle> from
   * every page, so a wrong handle is a dead link sitewide -- change them here
   * and nowhere else.
   *
   * The footer labels these LALO FARRO and SWAMP MAGAZINE rather than showing
   * the handles: `gemstone_harry` does not read as a person's name, and the
   * footer is the one place a reader is scanning for who rather than what.
   */
  instagramFounderHandle: "gemstone_harry",
  instagramMagazineHandle: "swamp_magazine",

  /**
   * Where the footer's CONTACT page points its mailto. PLACEHOLDER: no inbox
   * has been set up on the domain, and mail to an address whose MX does not
   * exist bounces without telling the sender anything useful.
   */
  contactEmail: "hello@swampmagazine.com",
} as const;
