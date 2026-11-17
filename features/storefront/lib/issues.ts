import { dials } from "@/config/dials";

import type { CatalogProduct } from "./catalog";
import { storefrontCopy } from "./storefront-copy";

// The grid is shown in issues, newest first: the National Issue's pieces in a row
// of their own above the first issue's. Which issue a product belongs to is a
// storefront decision rather than a database column (no migration), so it is
// listed here by slug; anything not listed is the first issue's.
const NATIONAL_ISSUE_SLUGS: readonly string[] = [
  "fc-shirt",
  "fc-hoodie",
  "croc-crop",
  "dog-tee",
  "triple-croc-tee",
];

export type IssueGroup = {
  heading: string;
  products: CatalogProduct[];
  /** Centre the tiles in their row, so a last row of one or two stands under the
   * middle rather than in the first column. */
  centered: boolean;
};

/** The catalog split into its issues, each with the line that heads its row.
 * An issue with nothing in it is left out. */
export function groupByIssue(products: CatalogProduct[]): IssueGroup[] {
  // A scattered grid is one field with no headings (and none to centre under):
  // the newest issue's pieces first, then the rest.
  if (dials.scatterProducts) {
    const ordered = [
      ...products.filter((product) =>
        NATIONAL_ISSUE_SLUGS.includes(product.slug),
      ),
      ...products.filter(
        (product) => !NATIONAL_ISSUE_SLUGS.includes(product.slug),
      ),
    ];
    return [{ heading: "", products: ordered, centered: false }];
  }

  const national = products.filter((product) =>
    NATIONAL_ISSUE_SLUGS.includes(product.slug),
  );
  const first = products.filter(
    (product) => !NATIONAL_ISSUE_SLUGS.includes(product.slug),
  );
  return [
    {
      heading: storefrontCopy.nationalIssueHeading,
      products: national,
      centered: true,
    },
    { heading: storefrontCopy.issueHeading, products: first, centered: false },
  ].filter((group) => group.products.length > 0);
}
