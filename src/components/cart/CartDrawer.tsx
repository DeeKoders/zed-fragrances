"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useMemo, useRef } from "react";
import { Bottle } from "@/components/product/Bottle";
import { brand } from "@/config/brand";
import { useDialog } from "@/hooks/useDialog";
import { buildOrder, orderTotals } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { ease } from "@/lib/motion";
import { productHref } from "@/lib/routes";
import { useCart } from "@/stores/cart";

const copy = brand.copy.cart;

const stepperClass =
  "grid size-9 place-items-center text-ivory transition-colors hover:text-gold-200 disabled:opacity-30";

/** The bag: slide-in drawer with quantities, totals (delivery included) and the way into checkout. */
export function CartDrawer() {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const open = useCart((state) => state.open);
  const items = useCart((state) => state.items);
  const setOpen = useCart((state) => state.setOpen);
  const setCheckoutOpen = useCart((state) => state.setCheckoutOpen);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const order = useMemo(() => buildOrder(items), [items]);
  // Before a payment method is chosen; COD charges are added in checkout.
  const totals = orderTotals(order, "wallet");
  const close = useCallback(() => setOpen(false), [setOpen]);

  // Restore the persisted bag after mount, so the server render always matches.
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  useDialog(open, panel, close);

  return (
    <AnimatePresence>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[65]">
          <motion.div
            className="absolute inset-0 bg-ink-950/75"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            ref={panel}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-ink-900"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: ease.lux }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 id={titleId} className="font-display text-h3 uppercase">
                {copy.title}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label={copy.close}
                className="grid size-11 place-items-center text-ivory transition-colors hover:text-gold-200"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {order.lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
                <p className="font-editorial text-editorial italic text-ivory-muted">{copy.empty}</p>
                <Link
                  href="/#collection"
                  onClick={close}
                  className="border border-gold-600 px-5 py-3 text-label uppercase text-gold-200 transition-colors hover:border-gold-300"
                >
                  {copy.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                <ul data-lenis-prevent className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-6">
                  {order.lines.map((line) => (
                    <li key={`${line.product.slug}-${line.ml}`} data-theme={line.product.slug} className="flex gap-4 py-5">
                      <div className="w-14 shrink-0 bg-accent-soft p-1">
                        <Bottle product={line.product} sizes="56px" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={productHref(line.product.slug)}
                              onClick={close}
                              className="font-display text-lg uppercase tracking-[0.08em] text-ivory hover:text-gold-200"
                            >
                              {line.product.name}
                            </Link>
                            <p className="text-micro uppercase text-accent-ink">
                              {line.product.concentration} · {line.ml}ml
                            </p>
                          </div>
                          <p className="text-sm text-gold-200">{formatPrice(line.lineTotal)}</p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div role="group" aria-label={copy.quantity} className="flex items-center border border-line">
                            <button
                              type="button"
                              aria-label={copy.decrease}
                              disabled={line.quantity <= 1}
                              onClick={() => setQuantity(line.product.slug, line.ml, line.quantity - 1)}
                              className={stepperClass}
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={copy.increase}
                              onClick={() => setQuantity(line.product.slug, line.ml, line.quantity + 1)}
                              className={stepperClass}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(line.product.slug, line.ml)}
                            className="text-micro uppercase text-ivory-muted underline-offset-4 transition-colors hover:text-gold-200 hover:underline"
                          >
                            {copy.remove}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line px-6 py-6">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ivory-muted">{copy.subtotal}</dt>
                      <dd className="tabular-nums text-ivory">{formatPrice(order.total)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ivory-muted">{copy.delivery}</dt>
                      <dd className="tabular-nums text-ivory">{formatPrice(totals.delivery)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                    <span className="text-label uppercase text-ivory-muted">{copy.total}</span>
                    <span className="font-display text-h3 tabular-nums text-gold-200">{formatPrice(totals.total)}</span>
                  </div>
                  {order.hasPriceOnRequest && <p className="mt-2 text-sm text-ivory-muted">{copy.onRequestNote}</p>}
                  <button
                    type="button"
                    data-cursor="order"
                    aria-haspopup="dialog"
                    onClick={() => setCheckoutOpen(true)}
                    className="sheen mt-6 flex w-full items-center justify-center gap-3 bg-gold-300 px-6 py-4 text-label uppercase text-ink-950 transition-colors hover:bg-gold-200"
                  >
                    {copy.checkout}
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
