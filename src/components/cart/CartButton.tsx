"use client";

import { brand } from "@/config/brand";
import { selectCount, useCart } from "@/stores/cart";

/** Header bag button with a live item count. */
export function CartButton() {
  const count = useCart(selectCount);
  const setOpen = useCart((state) => state.setOpen);
  const copy = brand.copy.cart;

  return (
    <button
      type="button"
      aria-label={`${copy.bag}, ${count} ${copy.items}`}
      aria-haspopup="dialog"
      onClick={() => setOpen(true)}
      className="relative grid size-11 place-items-center text-ivory transition-colors hover:text-gold-200"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5.5 8h13l-1.2 12.5H6.7L5.5 8Z" strokeLinejoin="round" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" strokeLinecap="round" />
      </svg>
      <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-semibold tabular-nums text-on-accent">
        {count}
      </span>
    </button>
  );
}
