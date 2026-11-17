"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";

// The product page's big picture and the order form are siblings in a server
// component, so "BOTH was picked" needs somewhere to live that both can reach.
const PairViewContext = createContext<((both: boolean) => void) | null>(null);
const PairActiveContext = createContext(false);

export function PairViewProvider({ children }: { children: ReactNode }) {
  const [both, setBoth] = useState(false);
  return (
    <PairViewContext.Provider value={setBoth}>
      <PairActiveContext.Provider value={both}>
        {children}
      </PairActiveContext.Provider>
    </PairViewContext.Provider>
  );
}

/** Lets the order form say whether BOTH is picked; a no-op off the product page. */
export function useSetPairView(): (both: boolean) => void {
  return useContext(PairViewContext) ?? (() => {});
}

/** The garment's picture: the one big cutout, until BOTH is picked, and then the
 * same cutout twice, side by side, in the same place. */
export function PairCutout({
  url,
  alt,
  sizes,
  className,
}: {
  url: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const both = useContext(PairActiveContext);
  if (!both) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        priority
        sizes={sizes}
        className={className}
      />
    );
  }
  return (
    // Wider than the single picture's box, centred on it, so each shirt keeps a
    // good size; narrow enough to stay on a phone's screen.
    <div className="absolute top-1/2 left-1/2 flex w-[130%] -translate-x-1/2 -translate-y-1/2">
      {[0, 1].map((index) => (
        <div key={index} className="relative aspect-square w-1/2">
          <Image
            src={url}
            alt={index === 0 ? alt : ""}
            fill
            sizes={sizes}
            className={className}
          />
        </div>
      ))}
    </div>
  );
}
