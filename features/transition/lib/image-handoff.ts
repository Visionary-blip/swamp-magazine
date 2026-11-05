// A phone's product tap carries the garment across the route change: the grid's
// cutout is lifted into a fixed "ghost" above the page veil, so it never leaves
// the screen while the grid goes dark, then flown onto the product page's own
// cutout while the page fades up around it. The ghost lives on <body> because
// it has to outlive both pages; this module is the only thing that knows about
// it. Two ends, one pending handoff at a time.
export const PHONE = "(max-width: 767px)";
const FLIGHT_MS = 520;
// Gives up if the destination never claims the ghost (no cutout on the product,
// a failed navigation), so a stray image is never left over the shop.
const ABANDON_MS = 3000;

type Pending = {
  ghost: HTMLImageElement;
  from: DOMRect;
  abandon: ReturnType<typeof setTimeout>;
  flying: boolean;
};

let pending: Pending | null = null;

function dispose() {
  if (!pending) return;
  clearTimeout(pending.abandon);
  pending.ghost.remove();
  pending = null;
}

export function handoffPending(): boolean {
  return pending !== null;
}

export function beginHandoff(source: HTMLImageElement) {
  dispose();
  const from = source.getBoundingClientRect();
  if (!source.currentSrc || from.width === 0) return;

  const ghost = document.createElement("img");
  ghost.src = source.currentSrc;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: "contain",
    transformOrigin: "0 0",
    // Above the veil (z-100), under nothing.
    zIndex: "101",
    pointerEvents: "none",
  });
  document.body.appendChild(ghost);
  pending = {
    ghost,
    from,
    abandon: setTimeout(dispose, ABANDON_MS),
    flying: false,
  };
}

// The product page's cutout box calls this once it is laid out. The real cutout
// stays hidden until the ghost has landed on it, then swaps in with no seam.
export function landHandoff(target: HTMLElement) {
  const current = pending;
  if (!current || current.flying) return;
  current.flying = true;
  clearTimeout(current.abandon);

  target.style.opacity = "0";
  const to = target.getBoundingClientRect();
  const scale = to.width / current.from.width;
  const flight = current.ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)" },
      {
        transform: `translate(${to.left - current.from.left}px, ${to.top - current.from.top}px) scale(${scale})`,
      },
    ],
    {
      duration: FLIGHT_MS,
      easing: "cubic-bezier(0.22, 0.8, 0.3, 1)",
      fill: "forwards",
    },
  );
  function done() {
    target.style.opacity = "";
    if (pending === current) dispose();
  }
  flight.onfinish = done;
  flight.oncancel = done;
}
