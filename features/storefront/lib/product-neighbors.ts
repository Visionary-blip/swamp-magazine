import type { CatalogProduct } from "./catalog";
import { groupByIssue } from "./issues";

export type ProductNeighbor = { slug: string; name: string };

export type ProductNeighbors = {
  previous: ProductNeighbor | null;
  next: ProductNeighbor | null;
};

/**
 * The products either side of `slug`, in the order the grid shows them (issue by
 * issue, as groupByIssue lays them out). It does not wrap: the first product has
 * no previous and the last no next, so the controls simply are not drawn there.
 */
export function getProductNeighbors(
  products: CatalogProduct[],
  slug: string,
): ProductNeighbors {
  const ordered = groupByIssue(products).flatMap((group) => group.products);
  const index = ordered.findIndex((product) => product.slug === slug);
  if (index === -1) return { previous: null, next: null };
  const pick = (product: CatalogProduct | undefined): ProductNeighbor | null =>
    product ? { slug: product.slug, name: product.name } : null;
  return {
    previous: pick(ordered[index - 1]),
    next: pick(ordered[index + 1]),
  };
}
