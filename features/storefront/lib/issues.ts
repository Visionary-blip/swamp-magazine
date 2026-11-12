import type { CatalogProduct } from "./catalog";
import { storefrontCopy } from "./storefront-copy";

// The grid is shown in issues, newest first: the National Issue's pieces in a row
// of their own above the first issue's. Which issue a product belongs to is a
// storefront decision rather than a database column (no migration), so it is
// listed here by slug; anything not listed is the first issue's.
const NATIONAL_ISSUE_SLUGS: readonly string[] = ["fc-shirt"];

export type IssueGroup = { heading: string; products: CatalogProduct[] };

/** The catalog split into its issues, each with the line that heads its row.
 * An issue with nothing in it is left out. */
export function groupByIssue(products: CatalogProduct[]): IssueGroup[] {
  const national = products.filter((product) =>
    NATIONAL_ISSUE_SLUGS.includes(product.slug),
  );
  const first = products.filter(
    (product) => !NATIONAL_ISSUE_SLUGS.includes(product.slug),
  );
  return [
    { heading: storefrontCopy.nationalIssueHeading, products: national },
    { heading: storefrontCopy.issueHeading, products: first },
  ].filter((group) => group.products.length > 0);
}
