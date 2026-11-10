import type { Metadata } from "next";

import { PlaceholderScreen } from "@/features/storefront";

export const metadata: Metadata = {
  title: "ABOUT — SWAMP MAGAZINE",
};

// LIFTED -- the founder's own words, verbatim. This route
// carries no site-mode gate: it leaks nothing about an unreleased drop, and a
// footer link that redirects to the storefront reads as broken.
const paragraphs = [
  "Swamp Magazine is a creative project by Lalo Farro. It is an attempt to reflect youth and imperfection through clothing, film, and photography. Despite capturing a relaxed aesthetic, each piece is meticulously designed and hand-printed. Swamp has been active since Fall of 2023. It started with pieces made in a print shop before switching to being entirely printed in bedrooms, bathrooms, and basements. Gaining traction especially during Fall of 2025, the team of excellent directors, screen printers, actors, and models has expanded rapidly.",
  "The National Issue is Swamp’s third official collection. Inspired by European football clubs, family crests, old English lions, and national flags, our designs are more ambitious than ever before.",
];

export default function AboutPage() {
  return (
    <PlaceholderScreen title="ABOUT" pending={false}>
      <div className="flex max-w-xl flex-col gap-5 text-center">
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="font-body text-[14px] leading-relaxed text-cream/80"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </PlaceholderScreen>
  );
}
