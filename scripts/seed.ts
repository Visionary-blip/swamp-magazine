// Seed: real catalog from swamp-images/ (BD-6). Masters are resized to
// <=2000px WebP with sharp, uploaded to Storage, and registered in the
// catalog tables + image_slots. Idempotent and safe to re-run: existing rows
// are never overwritten, so founder edits (prices, stock, swapped images)
// survive a re-seed.
//
// Catalog facts come from the founder's mockups (sizes + "PLEASE VENMO $NN"
// prices, read 2026-08-22). Inventory counts are PLACEHOLDERS -- the founder
// sets real stock before launch (P5 checklist).
//
// Run: bun run seed   (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY
// in .env.local; bun loads it automatically)

import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { z } from "zod";

const MAX_DIMENSION_PX = 2000;
const WEBP_QUALITY = 82;
const PLACEHOLDER_INVENTORY = 12;

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

type SeedProduct = {
  slug: string;
  name: string;
  priceCents: number;
  sizes: string[];
  modelCredits: string | null;
  cutoutFile: string;
  sortOrder: number;
};

const CATALOG: SeedProduct[] = [
  {
    slug: "vamp-tee",
    name: "Vamp Tee",
    priceCents: 2000,
    sizes: ["XS", "S", "M", "L", "XL"],
    modelCredits: "KIRBY-ANA (BEHIND)",
    cutoutFile: "swamp-images/VAMP GRID - AUG 9.png",
    sortOrder: 0,
  },
  {
    slug: "star-shorts",
    name: "Star Shorts",
    priceCents: 2500,
    sizes: ["S", "M", "L"],
    modelCredits: "MIA (L), DAVID (R)",
    cutoutFile: "swamp-images/STAR SHORTS GRID - AUG 9.png",
    sortOrder: 1,
  },
  {
    slug: "college-arch",
    name: "College Arch",
    priceCents: 2500,
    sizes: ["XS", "S", "M", "L"],
    modelCredits: "ANANYA (L), JESSICA (R)",
    cutoutFile: "swamp-images/COLLEGE ARCH GRID - AUG 9.png",
    sortOrder: 2,
  },
  {
    slug: "lurker-tee",
    name: "Lurker Tee",
    priceCents: 2500,
    sizes: ["XS", "S", "M", "L", "XL"],
    modelCredits: "JOE",
    cutoutFile: "swamp-images/LURKER GRID - AUG 9.png",
    sortOrder: 3,
  },
  // Facts off the founder's LONGSLEEVE mockups (LURKER LONG SLEEVE, M L,
  // "PLEASE VENMO $30", credits YLVA (L) / Z (R)). The row itself already
  // exists in the DB, created in the admin and left inactive, so this never
  // inserts it or touches its price; what it adds is the sizes and the cutout.
  // Activating it is still the founder's switch in the admin.
  {
    slug: "lurker-longsleeve",
    name: "Lurker Long Sleeve",
    priceCents: 3000,
    sizes: ["M", "L"],
    modelCredits: "YLVA (L), Z (R)",
    cutoutFile: "swamp-images/Lurker lonsleeve.png",
    sortOrder: 4,
  },
  // The National Issue's FC shirt, added 2026-11-11 from the founder's photo. The
  // sizes are the lurker tee's, and the $25 price and the stock are PLACEHOLDERS --
  // his to set in the admin. The storefront shows it in its own row above the first issue (see
  // features/storefront/lib/issues.ts).
  {
    slug: "fc-shirt",
    name: "FC Tee",
    priceCents: 2500,
    sizes: ["XS", "S", "M", "L", "XL"],
    modelCredits: "GARRETT, ADELINE",
    cutoutFile: "swamp-images/FC SHIRT GRID.webp",
    sortOrder: 6,
  },
  // The FC hoodie, added 2026-11-13. Its cutout is the founder's newer photo of
  // it (17 Nov); the first, near-black one and a purple stand-in are kept in
  // swamp-images/ as FC HOODIE PHOTO.webp and FC HOODIE GRID PURPLE.webp. The $50
  // price and the stock are placeholders; the founder sets both.
  {
    slug: "fc-hoodie",
    name: "FC Hoodie",
    priceCents: 5000,
    sizes: ["L", "XL"],
    modelCredits: "NIKITA (R), CALDER (L)",
    cutoutFile: "swamp-images/FC HOODIE GRID.webp",
    sortOrder: 5,
  },
  // The Croc Crop, added 2026-11-14 with a red stand-in for the cutout until the
  // real product shot exists (swap it in the admin). The $25 price and the stock
  // are placeholders; the founder sets them.
  {
    slug: "croc-crop",
    name: "Croc Crop",
    priceCents: 2500,
    sizes: ["XS", "S", "M", "L"],
    modelCredits: "FABI, ADELINE",
    cutoutFile: "swamp-images/CROC CROP GRID.webp",
    sortOrder: 7,
  },
  // The Dog Tee, added 2026-11-14 with a light blue stand-in for the cutout until
  // the real product shot exists (swap it in the admin). Treated like the lurker
  // tee: the same sizes, in the first issue's row, with Botched on offer. The $25
  // price is the founder's; the stock and "MODEL 1" are placeholders.
  {
    slug: "dog-tee",
    name: "Dog Tee",
    priceCents: 2500,
    sizes: ["XS", "S", "M", "L", "XL"],
    modelCredits: "MODEL 1",
    cutoutFile: "swamp-images/DOG TEE GRID.webp",
    sortOrder: 8,
  },
  // The Triple Croc Tee, added 2026-11-14 with a dark bluish-grey stand-in for the
  // cutout until the real product shot exists (swap it in the admin). Treated like
  // any other tee: the lurker tee's sizes, the first issue's row, Botched on
  // offer. The $35 price is the founder's; the stock and "MODEL 1" are
  // placeholders.
  {
    slug: "triple-croc-tee",
    name: "Triple Croc Tee",
    priceCents: 3500,
    sizes: ["XS", "S", "M", "L", "XL"],
    modelCredits: "MODEL 1",
    cutoutFile: "swamp-images/TRIPLE CROC TEE GRID.webp",
    sortOrder: 9,
  },
  // The Sleep Shirt, added 2026-11-17 with a sage green stand-in for the cutout
  // until the real product shot exists (swap it in the admin). $15 alone, $25 for
  // two (the two-pack is a dial, config/dials.ts). The sizes, the stock and
  // Connor's missing handle are placeholders the founder fills in.
  {
    slug: "sleep-shirt",
    name: "Sleep Shirt",
    priceCents: 1500,
    sizes: ["XS", "S", "M", "L", "XL"],
    modelCredits: "BRIANNA, CONNOR",
    cutoutFile: "swamp-images/SLEEP SHIRT EX-MODEL.webp",
    sortOrder: 10,
  },
];

// Product backgrounds. star-shorts is deliberately absent: its slot is already
// registered against SHORTS GRID BACKGROUND SS.png, and `uploadWebp` upserts,
// so listing it here would silently overwrite the live image with Zach's new
// shot. That swap is the founder's call (parked, see the Direction A
// hand-off); the admin uploader versions files instead of overwriting and is
// the safer mechanism for it.
//
// lurker-longsleeve IS here even though nothing on the storefront shows it yet:
// the founder created the product in the admin on 2026-08-28 and left it
// `active: false` with no sizes, so RLS keeps it off every public read. The
// slot is keyed by slug, so writing it now is inert until he activates the row
// -- and then the background is already in place instead of being one more
// thing to remember. Sizes, credits and the $30 price are still his to confirm.
const LIFESTYLE_SLOTS = [
  {
    slotKey: "product_bg:vamp-tee",
    file: "swamp-images/VAMP BG - ZACH.png",
    alt: "Vamp Tee lifestyle shot",
  },
  {
    slotKey: "product_bg:college-arch",
    file: "swamp-images/COLLEGE ARCH BG - ZACH.png",
    alt: "College Arch lifestyle shot",
  },
  {
    slotKey: "product_bg:lurker-tee",
    file: "swamp-images/LURKER BG - ZACH.png",
    alt: "Lurker Tee lifestyle shot",
  },
  {
    slotKey: "product_bg:lurker-longsleeve",
    file: "swamp-images/LURKER LONGSLEEVE BG - ZACH.png",
    alt: "Lurker Longsleeve lifestyle shot",
  },
  {
    slotKey: "product_bg:fc-hoodie",
    file: "swamp-images/FC HOODIE BG.jpg",
    alt: "FC Hoodie lifestyle shot",
  },
];

const env = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SECRET_KEY: z.string().min(1),
  })
  .parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function resizeToWebp(file: string): Promise<Buffer> {
  return sharp(path.join(REPO_ROOT, file))
    .resize(MAX_DIMENSION_PX, MAX_DIMENSION_PX, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function uploadWebp(bucket: string, storagePath: string, file: string) {
  const body = await resizeToWebp(file);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, body, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`upload ${bucket}/${storagePath}: ${error.message}`);
  console.log(`  uploaded ${bucket}/${storagePath} (${Math.round(body.byteLength / 1024)} KB)`);
}

async function registerSlot(slotKey: string, bucket: string, storagePath: string, alt: string) {
  // ignoreDuplicates keeps founder-swapped images intact on re-run.
  const { error } = await supabase
    .from("image_slots")
    .upsert(
      { slot_key: slotKey, bucket, storage_path: storagePath, alt },
      { onConflict: "slot_key", ignoreDuplicates: true },
    );
  if (error) throw new Error(`image_slots ${slotKey}: ${error.message}`);
}

async function seedProduct(product: SeedProduct) {
  console.log(`${product.name}:`);

  const existing = await supabase
    .from("products")
    .select("id")
    .eq("slug", product.slug)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  let productId = existing.data?.id as string | undefined;
  if (productId) {
    console.log("  product exists, leaving row untouched");
  } else {
    const inserted = await supabase
      .from("products")
      .insert({
        slug: product.slug,
        name: product.name,
        price_cents: product.priceCents,
        model_credits: product.modelCredits,
        sort_order: product.sortOrder,
      })
      .select("id")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    productId = inserted.data.id;
    console.log(`  inserted product (${product.priceCents / 100} USD)`);
  }

  const { error: variantError } = await supabase.from("product_variants").upsert(
    product.sizes.map((size, index) => ({
      product_id: productId,
      size,
      inventory_count: PLACEHOLDER_INVENTORY,
      sort_order: index,
    })),
    { onConflict: "product_id,size", ignoreDuplicates: true },
  );
  if (variantError) throw new Error(variantError.message);
  console.log(`  variants: ${product.sizes.join(", ")}`);

  const storagePath = `${product.slug}/cutout.webp`;
  await uploadWebp("products", storagePath, product.cutoutFile);
  await registerSlot(
    `product_cutout:${product.slug}`,
    "products",
    storagePath,
    `${product.name} product shot`,
  );
}

// `bun run seed lurker-longsleeve` seeds one product and its lifestyle slot;
// the full run needs every master in swamp-images/ and is the default.
const only = process.argv[2];

for (const product of CATALOG.filter((p) => !only || p.slug === only)) {
  await seedProduct(product);
}

for (const slot of LIFESTYLE_SLOTS.filter(
  (s) => !only || s.slotKey.endsWith(`:${only}`),
)) {
  const storagePath = `${slot.slotKey.replace(/[:]/g, "-")}.webp`;
  await uploadWebp("slots", storagePath, slot.file);
  await registerSlot(slot.slotKey, "slots", storagePath, slot.alt);
}

console.log("seed complete");
