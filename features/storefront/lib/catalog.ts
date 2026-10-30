import { CODE_ADD_ONS } from "@/lib/checkout/code-add-ons";
import { createClient } from "@/lib/supabase/server";

// Storefront data layer. Reads go through the anon server client, so RLS is
// the source of truth for what's visible (active products only). All lookups
// fail soft -- a broken read renders an empty grid / 404, never a crash --
// matching the mode gate's posture.

export type SlotImage = { url: string; alt: string };

export type ProductVariant = { size: string; soldOut: boolean };

export type CatalogProduct = {
  slug: string;
  name: string;
  priceCents: number;
  modelCredits: string | null;
  cutout: SlotImage | null;
  background: SlotImage | null;
  variants: ProductVariant[];
};

/** A small extra sold only alongside a garment (see the add_ons migration):
 * one variant carries its stock, so it is priced and stocked like any product. */
export type AddOn = {
  slug: string;
  name: string;
  priceCents: number;
  /** The single variant's size label ("ONE SIZE"), kept because order lines and
   * stock are per variant. */
  size: string;
  soldOut: boolean;
  cutout: SlotImage | null;
};

/** The landing's film band needs a `product_bg` too, and the slot map is
 * already in hand on the list read, so the background moved onto every catalog
 * row. Detail and list rows are the same shape now; the name is kept because
 * it says which read a caller made. */
export type ProductDetail = CatalogProduct;

export type LandingImagery = {
  hero: SlotImage | null;
  mascot: SlotImage | null;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type SlotRow = {
  slot_key: string;
  bucket: string;
  storage_path: string;
  alt: string | null;
};

type ProductRow = {
  is_add_on?: boolean;
  slug: string;
  name: string;
  price_cents: number;
  model_credits: string | null;
  product_variants: {
    size: string;
    inventory_count: number;
    sort_order: number;
  }[];
};

const PRODUCT_SELECT =
  "slug, name, price_cents, model_credits, is_add_on, product_variants(size, inventory_count, sort_order)";
// The same read without the add-on flag, for a database the add_ons migration
// has not reached yet: the shop must keep selling garments rather than go blank
// because a column is missing. Postgres' "undefined column" is 42703.
const LEGACY_PRODUCT_SELECT =
  "slug, name, price_cents, model_credits, product_variants(size, inventory_count, sort_order)";
const UNDEFINED_COLUMN = "42703";

export async function getCatalog(): Promise<CatalogProduct[]> {
  try {
    const supabase = await createClient();
    const [products, slots] = await Promise.all([
      readProducts(supabase),
      getSlotMap(supabase),
    ]);
    if (products.error) {
      console.error("[CATALOG]", products.error.code, products.error.message);
      return [];
    }
    return products.rows
      .filter((row) => !row.is_add_on)
      .map((row) => toCatalogProduct(row, slots));
  } catch (error) {
    console.error("[CATALOG]", error);
    return [];
  }
}

// Every active add-on, for the cart page's ADD-ONS section. Fails soft to none:
// a missing column or a broken read just hides the section.
export async function getAddOns(): Promise<AddOn[]> {
  const fromDb = await readDatabaseAddOns();
  // The ones that live in code come after, unless a row already covers the slug.
  const inCode = CODE_ADD_ONS.filter(
    (addOn) => !fromDb.some((row) => row.slug === addOn.slug),
  ).map((addOn) => ({
    slug: addOn.slug,
    name: addOn.name,
    priceCents: addOn.priceCents,
    size: addOn.size,
    soldOut: false,
    cutout: addOn.cutout,
  }));
  return [...fromDb, ...inCode];
}

async function readDatabaseAddOns(): Promise<AddOn[]> {
  try {
    const supabase = await createClient();
    const [products, slots] = await Promise.all([
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("is_add_on", true)
        .order("sort_order"),
      getSlotMap(supabase),
    ]);
    if (products.error) {
      // Before the migration there is no such column, and therefore no add-ons.
      if (products.error.code !== UNDEFINED_COLUMN) {
        console.error("[ADD_ONS]", products.error.code, products.error.message);
      }
      return [];
    }
    return ((products.data ?? []) as ProductRow[]).flatMap((row) => {
      const variant = [...row.product_variants].sort(
        (a, b) => a.sort_order - b.sort_order,
      )[0];
      // No variant means nothing to put in a cart or take stock from.
      if (!variant) return [];
      return [
        {
          slug: row.slug,
          name: row.name,
          priceCents: row.price_cents,
          size: variant.size,
          soldOut: variant.inventory_count <= 0,
          cutout: slots.get(`product_cutout:${row.slug}`) ?? null,
        },
      ];
    });
  } catch (error) {
    console.error("[ADD_ONS]", error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const supabase = await createClient();
    const [product, slots] = await Promise.all([
      readProduct(supabase, slug),
      getSlotMap(supabase),
    ]);
    if (product.error) {
      console.error("[PRODUCT]", product.error.code, product.error.message);
      return null;
    }
    if (!product.data) return null;
    // An add-on has no page of its own: it is only ever sold from the cart.
    if ((product.data as ProductRow).is_add_on) return null;
    return toCatalogProduct(product.data as ProductRow, slots);
  } catch (error) {
    console.error("[PRODUCT]", error);
    return null;
  }
}

// The founder's 16:9 hero (HERO 169, Aug 20). A bundled file rather than a
// slot row so the landing has its real hero before any admin upload; a
// landing_hero upload still wins. The alt is drafted, not the founder's.
const BUNDLED_HERO: SlotImage = {
  url: "/hero/landing-hero.jpg",
  alt: "Two people in SWAMP MAGAZINE sweatshirts sitting in warm, low light",
};

// landing_hero / landing_mascot are founder-upload slots (P4 admin). Until
// they exist, the hero is the bundled shot and the mascot slot renders nothing.
export async function getLandingImagery(): Promise<LandingImagery> {
  try {
    const supabase = await createClient();
    const slots = await getSlotMap(supabase);
    return {
      hero: slots.get("landing_hero") ?? BUNDLED_HERO,
      mascot: slots.get("landing_mascot") ?? null,
    };
  } catch (error) {
    console.error("[LANDING_IMAGERY]", error);
    return { hero: BUNDLED_HERO, mascot: null };
  }
}

async function readProducts(
  supabase: SupabaseServerClient,
): Promise<
  | { rows: ProductRow[]; error: null }
  | { rows: never[]; error: { code?: string; message: string } }
> {
  const first = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("sort_order");
  if (first.error?.code === UNDEFINED_COLUMN) {
    const legacy = await supabase
      .from("products")
      .select(LEGACY_PRODUCT_SELECT)
      .order("sort_order");
    if (legacy.error) return { rows: [], error: legacy.error };
    return { rows: (legacy.data ?? []) as ProductRow[], error: null };
  }
  if (first.error) return { rows: [], error: first.error };
  return { rows: (first.data ?? []) as ProductRow[], error: null };
}

async function readProduct(supabase: SupabaseServerClient, slug: string) {
  const first = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (first.error?.code !== UNDEFINED_COLUMN) return first;
  return supabase
    .from("products")
    .select(LEGACY_PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
}

// The whole slot table is a handful of rows; one read serves every lookup.
async function getSlotMap(
  supabase: SupabaseServerClient,
): Promise<Map<string, SlotImage>> {
  const { data, error } = await supabase
    .from("image_slots")
    .select("slot_key, bucket, storage_path, alt");
  if (error) {
    console.error("[IMAGE_SLOTS]", error.code, error.message);
    return new Map();
  }
  const map = new Map<string, SlotImage>();
  for (const row of (data ?? []) as SlotRow[]) {
    const { data: publicUrl } = supabase.storage
      .from(row.bucket)
      .getPublicUrl(row.storage_path);
    map.set(row.slot_key, { url: publicUrl.publicUrl, alt: row.alt ?? "" });
  }
  return map;
}

function toCatalogProduct(
  row: ProductRow,
  slots: Map<string, SlotImage>,
): CatalogProduct {
  return {
    slug: row.slug,
    name: row.name,
    priceCents: row.price_cents,
    modelCredits: row.model_credits,
    cutout: slots.get(`product_cutout:${row.slug}`) ?? null,
    background: slots.get(`product_bg:${row.slug}`) ?? null,
    variants: [...row.product_variants]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((variant) => ({
        size: variant.size,
        soldOut: variant.inventory_count <= 0,
      })),
  };
}

/**
 * The index number a product carries on the landing ("01"–"04"). Derived from
 * position in the `sort_order`-ordered list rather than from `sort_order`
 * itself, which is zero-based and free to have gaps once the founder reorders
 * the catalog in the admin. Lives here so the index rows and the film band's
 * caption can never disagree about which product is 03.
 */
export function catalogNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
