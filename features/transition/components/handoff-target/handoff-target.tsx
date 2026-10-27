"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { landHandoff } from "../../lib/image-handoff";

// The product page's cutout box: the destination of a HandoffLink's image.
export function HandoffTarget({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) landHandoff(ref.current);
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
