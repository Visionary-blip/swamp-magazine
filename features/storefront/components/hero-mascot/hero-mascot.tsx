"use client";

import { useNationalTheme } from "../../lib/national-theme";
import { GlideLink } from "../glide-link/glide-link";

// The flag bearer, the National Issue's mascot (public/world/flag-bearer.webp:
// the founder's drawing as a mask, so it takes the brand red and the hover
// yellow like the fisher does).
const FLAG_BEARER_URL = "/world/flag-bearer.webp";

// The landing's mascot: the fisher (the founder's upload, passed in as a mask
// URL) or, under the National Issue theme, the flag bearer. The same square box,
// link and hover either way, so the swap changes the drawing and nothing else.
export function HeroMascot({
  fisher,
  className,
}: {
  fisher: { maskUrl: string; alt: string } | null;
  className: string;
}) {
  const national = useNationalTheme();
  if (!national && !fisher) return null;
  const maskUrl = national ? FLAG_BEARER_URL : (fisher?.maskUrl ?? "");
  const label = national
    ? "Shop the products"
    : fisher?.alt || "Shop the products";

  return (
    <GlideLink
      href="#products"
      role="img"
      aria-label={label}
      className={`block aspect-square w-[34vw] max-w-52 ${className}`}
    >
      <span
        aria-hidden
        className="block size-full bg-current"
        style={{
          maskImage: `url(${maskUrl})`,
          WebkitMaskImage: `url(${maskUrl})`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
    </GlideLink>
  );
}
