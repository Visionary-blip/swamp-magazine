"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";

// The product page's big picture and the order form are siblings in a server
// component, so what the form has picked needs somewhere to live that both can
// reach: `mode` is a single design or BOTH, `picks` is each of the two shirts'
// designs under BOTH.
export type DesignView = {
  mode: string | null;
  picks: [string | null, string | null];
};

const NO_VIEW: DesignView = { mode: null, picks: [null, null] };

const DesignViewContext = createContext<((view: DesignView) => void) | null>(
  null,
);
const DesignActiveContext = createContext<DesignView>(NO_VIEW);

export function PairViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<DesignView>(NO_VIEW);
  return (
    <DesignViewContext.Provider value={setView}>
      <DesignActiveContext.Provider value={view}>
        {children}
      </DesignActiveContext.Provider>
    </DesignViewContext.Provider>
  );
}

/** Lets the order form say what is picked; a no-op off the product page. */
export function useSetDesignView(): (view: DesignView) => void {
  return useContext(DesignViewContext) ?? (() => {});
}

/** The garment's picture: its one cutout, or the picked design's own; and under
 * BOTH, the two shirts side by side in the same place, each in its design. */
export function PairCutout({
  url,
  alt,
  sizes,
  className,
  designImages,
}: {
  url: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Picture per design, for a garment that has them. */
  designImages: Record<string, string>;
}) {
  const { mode, picks } = useContext(DesignActiveContext);
  const designs = Object.keys(designImages);

  if (mode !== "BOTH") {
    return (
      <Image
        src={(mode && designImages[mode]) || url}
        alt={alt}
        fill
        priority
        sizes={sizes}
        className={className}
      />
    );
  }
  return (
    // Each shirt is 90% of the single picture, one either side of centre with a gap
    // between.
    // A phone has no room for two side by side, so there they are staggered down
    // the page, overlapping and tilted a little, like a +2 card in Uno.
    // A shirt with no design picked yet shows the design its place would take in
    // the pair.
    <>
      {[0, 1].map((index) => {
        const design = picks[index] ?? designs[index];
        return (
          <div
            key={index}
            className={
              index === 0
                ? "absolute inset-0 -translate-x-[55%] md:scale-90 max-md:-translate-x-[14%] max-md:-translate-y-[22%] max-md:-rotate-6 max-md:scale-[0.8]"
                : "absolute inset-0 translate-x-[55%] md:scale-90 max-md:translate-x-[14%] max-md:translate-y-[22%] max-md:rotate-6 max-md:scale-[0.8]"
            }
          >
            <Image
              src={(design && designImages[design]) || url}
              alt={index === 0 ? alt : ""}
              fill
              sizes={sizes}
              className={className}
            />
          </div>
        );
      })}
    </>
  );
}
