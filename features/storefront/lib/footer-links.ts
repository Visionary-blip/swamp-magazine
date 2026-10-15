import { dials } from "@/config/dials";

// The footer's destinations, apart from the markup, so reordering the footer or
// retargeting a link is an edit here rather than surgery on a component.
//
// COPY DISCIPLINE: every `label` and `heading` below is INVENTED -- none of it
// came off the founder's mockups, which have no footer at all. The same rule
// storefront-copy.ts runs under applies: these are a scaffold for Lalo to
// overwrite, not the site's voice. The only LIFTED strings the footer renders
// (the wordmark, the byline, the ticker) still come from storefront-copy.ts.
//
// Every internal href resolves to a stub page under app/ -- a footer that 404s
// is worse than no footer -- and each stub is `robots: noindex` until its copy
// is written. External hrefs resolve off config/dials.ts, where the handles
// are flagged as unconfirmed.

export type FooterLink = {
  label: string;
  href: string;
  /** Leaves the site: renders target="_blank" and rel="noreferrer". */
  external?: boolean;
};

export type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

export const footerColumns: readonly FooterColumn[] = [
  {
    heading: "THE MAGAZINE",
    links: [
      { label: "ABOUT", href: "/about" },
    ],
  },
  {
    heading: "ORDERS",
    links: [
      { label: "SHIPPING & RETURNS", href: "/shipping" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    // Instagram only -- no TikTok (Zach, 2026-09-21). Two accounts, because the
    // founder's personal feed and the magazine's are not the same audience.
    heading: "FOLLOW",
    links: [
      {
        label: "LALO FARRO",
        href: `https://instagram.com/${dials.instagramFounderHandle}`,
        external: true,
      },
      {
        label: "SWAMP MAGAZINE",
        href: `https://instagram.com/${dials.instagramMagazineHandle}`,
        external: true,
      },
    ],
  },
] as const;

// The fine-print row. ADMIN sits here rather than in a column because it is a
// door for one person, not a section of the site: /admin is already behind the
// Google allowlist, so linking it costs nothing but it should not read as
// public navigation.
export const footerLegalLinks: readonly FooterLink[] = [
  { label: "PRIVACY", href: "/privacy" },
  { label: "TERMS", href: "/terms" },
  { label: "ADMIN", href: "/admin" },
] as const;
