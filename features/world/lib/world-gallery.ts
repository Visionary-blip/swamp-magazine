// The shoot photographs on the WORLD gallery, grouped under the founder's
// headings, in reading order. Bundled files, like the product galleries, so
// adding one is a code change. Alt text stays generic: credits live with the
// products.
export type WorldGallerySection = {
  heading: string;
  /** A few lines about the shoot, behind a small "?" beside the heading. */
  note?: string;
  images: readonly { src: string; alt: string }[];
};

function shots(from: number, to: number): { src: string; alt: string }[] {
  return Array.from({ length: to - from + 1 }, (_, index) => ({
    src: `/world/gallery-${from + index}.webp`,
    alt: "Swamp Magazine shoot photograph",
  }));
}

export const worldGallery: readonly WorldGallerySection[] = [
  // The pile-of-clothes shoot.
  {
    heading: "DREGS S/S 24",
    // The founder's words.
    note: "“Dregs”, defined as a residue found at the bottom of a body of water or the least desirable aspect of something, is Swamp’s ongoing loungewear collection. Each piece is thrifted and hand-printed. I additionally encourage customers to bring in their own pieces for print. This has helped build a small community rooted in sustainability and creativity.",
    images: shots(1, 10),
  },
  // The pink-and-maroon shirt shoot, then the stoop and couch shoot.
  {
    heading: "STANDARD ISSUE S/S 25",
    note: "Standard Issue: Swamp’s second official collection. While I was abroad, all designs were relayed to Jason Bourne. All pieces were printed by Jason. All Pictures were taken By Jason and Jonathan",
    images: shots(11, 27),
  },
];
