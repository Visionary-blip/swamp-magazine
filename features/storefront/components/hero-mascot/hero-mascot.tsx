"use client";

import { useEffect, useState } from "react";

import { useNationalTheme } from "../../lib/national-theme";
import { GlideLink } from "../glide-link/glide-link";

// The flag bearer, the National Issue's mascot (public/world/flag-bearer.webp:
// the founder's drawing as a mask, so it takes the brand red and the hover
// yellow like the fisher does).
const FLAG_BEARER_URL = "/world/flag-bearer.webp";
// The three crocs, the National Issue's second mascot, made as a mask the same way.
const THREE_CROCS_URL = "/world/three-crocs.webp";
const NATIONAL_MASCOTS = [FLAG_BEARER_URL, THREE_CROCS_URL];
// How long each National Issue mascot stays up before the next one takes over.
const MASCOT_SWAP_MS = 5000;

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
  const [turn, setTurn] = useState(0);

  // Counting only while the theme is on, so switching it on always opens with the
  // flag bearer and the fisher's page never runs a timer.
  useEffect(() => {
    if (!national) return;
    const timer = setInterval(() => setTurn((t) => t + 1), MASCOT_SWAP_MS);
    return () => {
      clearInterval(timer);
      setTurn(0);
    };
  }, [national]);

  if (!national && !fisher) return null;
  const maskUrl = national
    ? NATIONAL_MASCOTS[turn % NATIONAL_MASCOTS.length]
    : (fisher?.maskUrl ?? "");
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
