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
// The dog and the shield, likewise masks of the founder's drawings.
const DOG_URL = "/world/dog.webp";
const SHIELD_URL = "/world/shield.webp";

// Each drawing is tall and narrow beside the fisher, which fills its square, so at
// the same box they read smaller. `scale` grows each until its drawn area (box
// width x height) matches the fisher's; measured from the alpha bounds of the
// masks, not by eye.
const NATIONAL_MASCOTS = [
  { url: FLAG_BEARER_URL, scale: 1.2 },
  { url: THREE_CROCS_URL, scale: 1.15 },
  // Centred on its eye, not its bounds: the eye sits a little above the
  // middle of the drawing, so `shift` (percent of the box) pulls it to the centre.
  { url: DOG_URL, scale: 1.08, shift: { x: 2, y: 5 } },
  { url: SHIELD_URL, scale: 1.24 },
];
// How long each National Issue mascot stays up before the next one takes over.
const MASCOT_SWAP_MS = 1500;

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
  const mascot = national
    ? NATIONAL_MASCOTS[turn % NATIONAL_MASCOTS.length]
    : null;
  const maskUrl = mascot ? mascot.url : (fisher?.maskUrl ?? "");
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
          transform: mascot
            ? `translate(${mascot.shift?.x ?? 0}%, ${mascot.shift?.y ?? 0}%) scale(${mascot.scale})`
            : undefined,
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
