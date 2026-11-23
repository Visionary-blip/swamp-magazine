import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getStorefrontMode } from "@/features/admin";
import {
  ProductScreen,
  getCatalog,
  getProduct,
  getProductNeighbors,
} from "@/features/storefront";
import { isAtOrderCapacity } from "@/lib/order-capacity.server";

// Same gate as "/": product pages must not leak an unreleased drop, and
// inventory-driven sold-out states need per-request reads.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return {
    title: product
      ? `${product.name.toUpperCase()} — SWAMP MAGAZINE`
      : "SWAMP MAGAZINE",
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const mode = await getStorefrontMode();
  if (mode !== "live" || (await isAtOrderCapacity())) redirect("/");

  const { slug } = await params;
  const [product, catalog] = await Promise.all([
    getProduct(slug),
    getCatalog(),
  ]);
  if (!product) notFound();

  return (
    <ProductScreen
      product={product}
      neighbors={getProductNeighbors(catalog, slug)}
    />
  );
}
