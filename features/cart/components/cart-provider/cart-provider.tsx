"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  CART_STORAGE_KEY,
  addToCart,
  changeCartSize,
  parseStoredCart,
  removeFromCart,
  type CartItem,
  type CartState,
  type DeliveryChoice,
} from "../../lib/cart";

type CartContextValue = {
  items: CartItem[];
  delivery: DeliveryChoice;
  setDelivery: (delivery: DeliveryChoice) => void;
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, size: string) => void;
  changeSize: (slug: string, from: string, to: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// The cart lives in localStorage and React reads it as an external store, so the
// first (server-matching) render is an empty cart and the saved one arrives
// right after hydration without an effect that sets state. Storage can be
// missing or throw (private windows, blocked site data); `memory` keeps the
// cart working for the visit in that case.
let memory: string | null = null;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return memory;
  }
}

function writeRaw(raw: string) {
  memory = raw;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, raw);
  } catch {
    // The in-memory copy above still serves this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changing the cart should show here too.
  function onStorage(event: StorageEvent) {
    if (event.key === CART_STORAGE_KEY) listener();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(change: (current: CartState) => CartState) {
  writeRaw(JSON.stringify(change(parseStoredCart(readRaw()))));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const state = useMemo(() => parseStoredCart(raw), [raw]);

  const setDelivery = useCallback(
    (delivery: DeliveryChoice) =>
      update((current) => ({ ...current, delivery })),
    [],
  );
  const addItem = useCallback(
    (item: CartItem) =>
      update((current) => ({
        ...current,
        items: addToCart(current.items, item),
      })),
    [],
  );
  const removeItem = useCallback(
    (slug: string, size: string) =>
      update((current) => ({
        ...current,
        items: removeFromCart(current.items, slug, size),
      })),
    [],
  );
  const changeSize = useCallback(
    (slug: string, from: string, to: string) =>
      update((current) => ({
        ...current,
        items: changeCartSize(current.items, slug, from, to),
      })),
    [],
  );
  const clear = useCallback(
    () => update((current) => ({ ...current, items: [] })),
    [],
  );

  const value = useMemo(
    () => ({
      items: state.items,
      delivery: state.delivery,
      setDelivery,
      addItem,
      removeItem,
      changeSize,
      clear,
    }),
    [state, setDelivery, addItem, removeItem, changeSize, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside <CartProvider>");
  return value;
}
