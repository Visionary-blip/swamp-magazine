# SWAMP MAGAZINE

The web store and admin for SWAMP MAGAZINE ("The Third Issue, from Lalo Farro"). The store sells a small catalog of clothing, one product per order with no cart, and a buyer chooses pickup or shipping at a flat rate. Before a drop the site runs in coming-soon mode and collects email addresses.

## How it works

One row in the `site_settings` table decides what the public sees. In coming-soon mode the home page shows a subscribe form (an email address and an optional phone number), plus a countdown when a drop time is set. In live mode the home page shows the storefront, and the product pages take orders. Product pages redirect to the home page while the site is not live. The home page reads the row on every request, so a change in the admin takes effect without a deploy.

The mode fails closed. A missing row or a failed read resolves to coming soon. An admin can also set a drop time, and once that time has passed the site reads as live even if the stored mode still says coming soon. The rules are in `lib/site-mode.ts`.

A buyer picks a size and a delivery method on a product page. A server action (`actions/create-checkout-session.ts`) prices the order from the database, checks stock, and creates a Stripe Checkout Session. The card step renders inside the page with Stripe Elements. Stripe then calls `/api/stripe/webhook`, which verifies the signature and calls a database function that marks the order paid and decrements stock in one transaction. A replayed event does nothing the second time. If two buyers race for the last unit, the webhook still marks the paid order and then refunds it. A confirmation email goes out through Resend. After payment the buyer lands on `/order`.

The admin lives under `/admin` and is reached through Google sign-in on Supabase Auth. Google decides who you are, and the `ADMIN_EMAILS` allowlist decides whether you get in. The screens are a dashboard (site mode and drop time), products and stock, image slots (upload, resize, replace or clear), subscribers with a CSV export, and orders.

A drop announcement is built in the code but no admin screen calls it yet. `actions/send-announcement.ts` sends the `emails/drop-announcement.tsx` template in batches to subscribers who gave email consent and have not unsubscribed, with an unsubscribe link in each email.

## Stack

- Next.js 16.3.2 (App Router), React 19.2.8, TypeScript in strict mode, Tailwind CSS 4, Motion
- Supabase for Postgres, Storage and Auth
- Stripe for payments
- Resend and React Email for mail
- sharp for image resizing, zod for validation
- vitest for tests, ESLint and Prettier for style
- bun 1.2.9 as the package manager and script runner

## Setup

Install the packages and copy the environment template.

```bash
bun install
cp .env.example .env.local
```

The app validates its environment at startup (`lib/env/client.ts` and `lib/env/server.ts`) and does not run without the required variables. Application code never reads `process.env` directly.

| Variable | Needed | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Public, sent to the browser |
| `SUPABASE_SECRET_KEY` | yes | Server only, bypasses row-level security |
| `RESEND_API_KEY` | yes | Server only |
| `RESEND_FROM` | no | Sender address, defaults to Resend's unverified test sender |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for checkout | The app boots without it, but the card step fails |
| `STRIPE_SECRET_KEY` | for checkout | Server only |
| `STRIPE_WEBHOOK_SECRET` | for checkout | Signing secret for `/api/stripe/webhook` |
| `ADMIN_EMAILS` | for the admin | Comma-separated list of allowed addresses |

The database schema is the SQL in `supabase/migrations`. Apply the files to a Supabase project in filename order. They create the tables, row-level security policies, the `products` and `slots` storage buckets, and the payment function. One file, `20260822205330_new-migration.sql`, is empty. The admin sign-in uses the Google provider in Supabase Auth, and its callback route is `/admin/auth/callback`.

To load the catalog, run the seed script.

```bash
bun run seed
```

The seed reads the founder's master photos from `swamp-images/` and one PNG at the repository root. Both are gitignored, so a fresh clone does not have them. The script resizes each image to a WebP of at most 2000 pixels, uploads it to Storage, and registers the product, sizes and image slot. It is safe to run again, because it never overwrites a row that already exists. The stock counts it writes are placeholders.

## Run

```bash
bun run dev
```

The dev server listens on http://localhost:3000. A fresh database starts in coming-soon mode. To see the storefront, set the mode to live in the admin, or run the mode script.

```bash
bun run scripts/flip-mode.ts live
bun run scripts/flip-mode.ts coming_soon
```

The script needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env.local`.

## Commands

| Command | Does |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run start` | Serve the production build |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint, and any warning fails the run |
| `bun run test` | `vitest run` |
| `bun run format` | `prettier --write .` |
| `bun run seed` | Load the catalog and images |

The project has no CI, so these four commands are the gates: build, typecheck, lint and test. On a cold tree run the build before the typecheck, because `tsc` reads route types that the build generates. `scripts/swamp-magazine` wraps all of the commands above. `scripts/swamp-magazine gates` runs the four gates in that order, and `scripts/swamp-magazine shell` prints a zsh function and completion for the command.

Tests sit beside the code as `*.test.ts` files. They cover logic where a failure would be silent: site mode, money handling, order drafts, webhook signatures and event handling, announcement batching, and the admin helpers. The UI has no component tests.

## Layout

- `app/` holds the routes: the home page, `/product/[slug]`, `/order`, `/unsubscribe`, the footer pages (`/about`, `/contact`, `/faq`, `/privacy`, `/shipping`, `/stockists`, `/terms`), the admin under `/admin`, `/api/stripe/webhook`, and the sitemap, manifest and Open Graph images. Pages stay thin and render a screen from `features/`.
- `features/` holds one folder per area: `storefront`, `checkout`, `coming-soon`, `order` and `admin`. Each has `components/`, `lib/` where needed, and an `index.ts` that is its public surface.
- `actions/` holds the server actions, such as checkout, subscribe, unsubscribe, the announcement send, and the admin mutations.
- `lib/` holds shared code: the Supabase clients, the environment schemas, the Stripe client, site mode, money formatting, and the checkout logic.
- `config/dials.ts` holds every tunable number and site constant in one file: shipping rate, announcement batch size, image upload limits, the canonical site URL and the Instagram handles. Change a value there and not in the code that uses it.
- `emails/` holds the React Email templates for the order confirmation, the subscribe confirmation and the drop announcement.
- `supabase/migrations/` holds the schema. `scripts/` holds the seed script, the mode flip and the command wrapper.
- `proxy.ts` is the Next.js 16 proxy. It refreshes the Supabase session for `/admin` only, and the real access check runs again on the server for every admin render.

## Deploy

The app deploys to Vercel. The local `.vercel/` folder holds the project link and is gitignored. Set the same variables from the table above in the Vercel project, and point a Stripe webhook endpoint at `/api/stripe/webhook` on the deployed origin. The handler acts on `checkout.session.completed` and `checkout.session.async_payment_succeeded` and ignores other events. The canonical origin is `https://swampmagazine.com`, set in `config/dials.ts`, and it feeds the sitemap, the Open Graph tags and the links in emails.

## Where to read next

`CLAUDE.md` holds the working rules for agent sessions. The code standard is `docs/conventions-typescript.md`, and the process standard is `docs/AGENT-PRACTICES.md`. Open work is tracked in `docs/incomplete/`, which has its own `README.md`. The foundation effort in `docs/incomplete/foundation/` holds the ratified design decisions (`DESIGN.md`), the phase plan and build status (`PLAN.md`), and the recorded runtime checks (`RUNTIME-PASS.md`).
