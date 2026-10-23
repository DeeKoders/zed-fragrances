import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = { slug: string; ml: number; quantity: number };

const MAX_QUANTITY = 20;

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (slug: string, ml: number, quantity?: number) => void;
  setQuantity: (slug: string, ml: number, quantity: number) => void;
  remove: (slug: string, ml: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const same = (item: CartItem, slug: string, ml: number) => item.slug === slug && item.ml === ml;
const clamp = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity)));

/**
 * The bag. Items persist to localStorage; the drawer's open state doesn't. Hydration is skipped at
 * creation and done after mount (CartRehydrate) so the server markup always matches the first render.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (slug, ml, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => same(item, slug, ml));
          const items = existing
            ? state.items.map((item) => (item === existing ? { ...item, quantity: clamp(item.quantity + quantity) } : item))
            : [...state.items, { slug, ml, quantity: clamp(quantity) }];
          return { items };
        }),
      setQuantity: (slug, ml, quantity) =>
        set((state) => ({
          items: state.items.map((item) => (same(item, slug, ml) ? { ...item, quantity: clamp(quantity) } : item)),
        })),
      remove: (slug, ml) => set((state) => ({ items: state.items.filter((item) => !same(item, slug, ml)) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "zed-cart",
      version: 1,
      // window (not the bare global) so the server, where Node may expose its own localStorage, gets none.
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);

export const selectCount = (state: CartState) => state.items.reduce((total, item) => total + item.quantity, 0);
