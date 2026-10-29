"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { brand } from "@/config/brand";
import { useDialog } from "@/hooks/useDialog";
import {
  buildOrder,
  orderMessage,
  orderTotals,
  paymentFee,
  paymentMethods,
  placeOrder,
  PHONE_PATTERN,
  type Customer,
  type OrderTotals,
  type PaymentMethod,
  type Screenshot,
} from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { ease } from "@/lib/motion";
import { prepareScreenshot, screenshotUrl } from "@/lib/screenshot";
import { whatsappUrl } from "@/lib/whatsapp";
import { useCart } from "@/stores/cart";

const copy = brand.copy.checkout;
const cartCopy = brand.copy.cart;
const wallet = brand.checkout.wallet;

type Step = "details" | "pay" | "done";
type Status = "idle" | "sending" | "error";
type Placed = { id: string; payment: PaymentMethod };

const emptyCustomer: Customer = { name: "", phone: "", city: "", address: "", notes: "" };

const headingClass = "text-label uppercase text-gold-200 outline-none";
const labelClass = "text-micro uppercase text-ivory-muted";
const fieldClass =
  "mt-2 block w-full border border-line bg-ink-950/60 px-4 py-3 text-body text-ivory transition-colors placeholder:text-ivory-muted/60 focus:border-gold-300 focus:outline-none";
const primaryClass =
  "sheen flex w-full items-center justify-center gap-3 bg-gold-300 px-6 py-4 text-label uppercase text-ink-950 transition-colors hover:bg-gold-200 disabled:cursor-wait disabled:opacity-60";
const linkClass = "text-micro uppercase text-ivory-muted underline-offset-4 transition-colors hover:text-gold-200 hover:underline";

/**
 * Checkout popup, opened from the bag or "Buy now": delivery details and a choice of EasyPaisa /
 * JazzCash (account details plus a payment screenshot) or cash on delivery, then a confirmation.
 * Orders go to /api/orders. Details stay filled in for the session.
 */
export function CheckoutDialog() {
  const titleId = useId();
  const phoneHintId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const sending = useRef(false);
  const moved = useRef(false);

  const open = useCart((state) => state.checkoutOpen);
  const items = useCart((state) => state.items);
  const setCheckoutOpen = useCart((state) => state.setCheckoutOpen);
  const clear = useCart((state) => state.clear);
  const order = useMemo(() => buildOrder(items), [items]);

  const [step, setStep] = useState<Step>("details");
  const [customer, setCustomer] = useState(emptyCustomer);
  const [choice, setChoice] = useState<PaymentMethod>("wallet");
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [placed, setPlaced] = useState<Placed | null>(null);

  // Paying into the wallet needs a known amount.
  const walletAvailable = !order.hasPriceOnRequest;
  const payment: PaymentMethod = walletAvailable ? choice : "cod";
  const totals = orderTotals(order, payment);

  // Stable for useDialog. Reopening starts at the details (still filled in); an order in flight can't be closed.
  const close = useCallback(() => {
    if (sending.current) return;
    setCheckoutOpen(false);
    setStep("details");
    setPlaced(null);
    setStatus("idle");
  }, [setCheckoutOpen]);

  useDialog(open, panel, close);

  const show = (next: Step) => {
    moved.current = true;
    setStatus("idle");
    setStep(next);
  };

  // A new step starts at the top, with focus on its heading.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    body.current?.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const update = (field: keyof Customer) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    try {
      setScreenshot(await prepareScreenshot(file));
    } catch {
      setUploadError(copy.screenshot.invalid);
    }
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    void choose(event.target.files?.[0]);
    event.target.value = "";
  };

  const submit = async () => {
    if (sending.current) return;
    sending.current = true;
    setStatus("sending");
    try {
      const id = await placeOrder({ items, customer, payment, screenshot: payment === "wallet" ? screenshot : null });
      setPlaced({ id, payment });
      setScreenshot(null);
      setCustomer((current) => ({ ...current, notes: "" }));
      clear();
      show("done");
    } catch {
      setStatus("error");
    } finally {
      sending.current = false;
    }
  };

  const onDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (payment === "wallet") show("pay");
    else void submit();
  };

  const onPay = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (screenshot) void submit();
    else setUploadError(copy.screenshot.required);
  };

  const footer = (label: string) => (
    <TotalBar
      totals={totals}
      label={status === "sending" ? copy.placing : label}
      sending={status === "sending"}
      error={status === "error" ? whatsappUrl(orderMessage(order, payment, customer)) : null}
    />
  );

  let content: ReactNode;
  if (step === "done" && placed) {
    content = (
      <Scroll ref={body} step={step} className="py-12 text-center">
        <span aria-hidden className="mx-auto grid size-16 rotate-45 place-items-center border border-gold-400 bg-ink-950/60">
          <svg viewBox="0 0 24 24" className="size-7 -rotate-45 text-gold-200" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 ref={heading} tabIndex={-1} className="mt-10 font-display text-h3 uppercase outline-none">
          {copy.done.title}
        </h3>
        <p className="mt-3 text-label uppercase text-ivory-muted">
          {copy.done.order} <span className="tabular-nums text-gold-200">{placed.id}</span>
        </p>
        <DiamondDivider className="mx-auto mt-6 max-w-40" />
        <p className="mx-auto mt-6 max-w-sm font-editorial text-editorial italic text-ivory">{copy.done[placed.payment]}</p>
        <button type="button" onClick={close} className={cn(primaryClass, "mt-10")}>
          {copy.done.cta}
        </button>
        <a
          href={whatsappUrl(`${brand.copy.whatsapp.question} ${placed.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(linkClass, "mt-6 inline-block")}
        >
          {copy.done.help}
        </a>
      </Scroll>
    );
  } else if (order.lines.length === 0) {
    content = (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="font-editorial text-editorial italic text-ivory-muted">{cartCopy.empty}</p>
      </div>
    );
  } else if (step === "pay") {
    content = (
      <form onSubmit={onPay} noValidate className="flex min-h-0 flex-1 flex-col">
        <Scroll ref={body} step={step}>
          <button type="button" onClick={() => show("details")} className={linkClass}>
            ← {copy.back}
          </button>
          <h3 ref={heading} tabIndex={-1} className={cn(headingClass, "mt-6")}>
            {copy.pay.title}
          </h3>
          <p className="mt-2 text-sm text-ivory-muted">{copy.pay.intro}</p>

          <div className="mt-6 border border-gold-700 bg-ink-950/60 p-5">
            <ul className="flex flex-wrap gap-2">
              {wallet.providers.map((provider) => (
                <li key={provider} className="border border-gold-600 px-3 py-1.5 text-micro uppercase text-gold-200">
                  {provider}
                </li>
              ))}
            </ul>
            <dl className="mt-4 divide-y divide-line">
              <Detail label={copy.pay.accountNumber} value={wallet.accountNumber} copyText={wallet.accountNumber.replace(/\D/g, "")} large />
              <Detail label={copy.pay.accountTitle} value={wallet.accountTitle} />
              <Detail label={copy.pay.amount} value={formatPrice(totals.total)} copyText={String(totals.total)} />
            </dl>
          </div>

          <ScreenshotField screenshot={screenshot} error={uploadError} onFile={onFile} onDrop={choose} onRemove={() => setScreenshot(null)} />
        </Scroll>
        {footer(copy.placeOrder)}
      </form>
    );
  } else {
    content = (
      <form onSubmit={onDetails} className="flex min-h-0 flex-1 flex-col">
        <Scroll ref={body} step={step}>
          <h3 ref={heading} tabIndex={-1} className={headingClass}>
            {copy.details}
          </h3>
          <div className="mt-5 grid gap-5">
            <label className="block">
              <span className={labelClass}>{copy.name}</span>
              <input name="name" required maxLength={80} autoComplete="name" value={customer.name} onChange={update("name")} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{copy.phone}</span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                required
                pattern={PHONE_PATTERN}
                title={copy.phoneHint}
                autoComplete="tel"
                aria-describedby={phoneHintId}
                value={customer.phone}
                onChange={update("phone")}
                className={fieldClass}
              />
              <span id={phoneHintId} className="mt-2 block text-sm text-ivory-muted">
                {copy.phoneHint}
              </span>
            </label>
            <label className="block">
              <span className={labelClass}>{copy.city}</span>
              <input name="city" required maxLength={60} autoComplete="address-level2" value={customer.city} onChange={update("city")} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{copy.address}</span>
              <textarea
                name="address"
                required
                rows={3}
                maxLength={300}
                autoComplete="street-address"
                value={customer.address}
                onChange={update("address")}
                className={cn(fieldClass, "resize-none")}
              />
            </label>
            <label className="block">
              <span className={labelClass}>{copy.notes}</span>
              <textarea name="notes" rows={2} maxLength={500} value={customer.notes} onChange={update("notes")} className={cn(fieldClass, "resize-none")} />
            </label>
          </div>

          <fieldset className="mt-10">
            <legend className={headingClass}>{copy.payment}</legend>
            <div className="mt-4 grid gap-3">
              {paymentMethods.map((method) => {
                const fee = paymentFee(method);
                return (
                  <label
                    key={method}
                    className={cn(
                      "group flex cursor-pointer items-start gap-4 border border-line p-4 transition-colors duration-300 hover:border-gold-600",
                      "has-checked:border-gold-300 has-checked:bg-accent-soft has-disabled:cursor-not-allowed has-disabled:opacity-40",
                      "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={payment === method}
                      disabled={method === "wallet" && !walletAvailable}
                      onChange={() => setChoice(method)}
                      className="sr-only"
                    />
                    <span aria-hidden className="mt-1.5 grid size-4 shrink-0 place-items-center rounded-full border border-gold-400">
                      <span className="size-2 rounded-full bg-gold-300 opacity-0 transition-opacity group-has-checked:opacity-100" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-lg tracking-[0.08em] text-ivory">{copy[method].label}</span>
                      <span className="mt-0.5 block text-sm text-ivory-muted">{copy[method].hint}</span>
                    </span>
                    {fee > 0 && <span className="shrink-0 text-sm tabular-nums text-gold-200">+ {formatPrice(fee)}</span>}
                  </label>
                );
              })}
            </div>
            {!walletAvailable && <p className="mt-3 text-sm text-ivory-muted">{copy.walletUnavailable}</p>}
          </fieldset>

          <section aria-label={copy.summary} className="mt-10 border-t border-line pt-6">
            <h3 className={headingClass}>{copy.summary}</h3>
            <ul className="mt-4 space-y-2">
              {order.lines.map((line) => (
                <li key={`${line.product.slug}-${line.ml}`} className="flex justify-between gap-4 text-sm">
                  <span className="text-ivory">
                    {line.product.name}{" "}
                    <span className="text-ivory-muted">
                      {line.ml}ml × {line.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums text-ivory">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <Row label={cartCopy.subtotal} value={totals.subtotal} />
              <Row label={cartCopy.delivery} value={totals.delivery} />
              {totals.codFee > 0 && <Row label={copy.codFee} value={totals.codFee} />}
            </dl>
            {order.hasPriceOnRequest && <p className="mt-3 text-sm text-ivory-muted">{cartCopy.onRequestNote}</p>}
          </section>
        </Scroll>
        {footer(payment === "wallet" ? copy.continue : copy.placeOrder)}
      </form>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="fixed inset-0 z-[66] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-ink-950/80"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            ref={panel}
            className="relative flex max-h-[94svh] w-full flex-col border-t border-line bg-ink-900 sm:max-h-[min(90svh,54rem)] sm:max-w-lg sm:border"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ duration: 0.5, ease: ease.lux }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
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
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** The scrolling body of a step; it fades in when the step changes. */
function Scroll({
  ref,
  step,
  className,
  children,
}: {
  ref: RefObject<HTMLDivElement | null>;
  step: Step;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div ref={ref} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: ease.lux }}
        className={cn("px-6 py-6", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Sticky total and submit button; on failure, the error with a WhatsApp link (`error` is its URL). */
function TotalBar({ totals, label, sending, error }: { totals: OrderTotals; label: string; sending: boolean; error: string | null }) {
  return (
    <div className="border-t border-line px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 sm:pb-6">
      <div className="flex items-baseline justify-between">
        <span className="text-label uppercase text-ivory-muted">{cartCopy.total}</span>
        <span className="font-display text-h3 tabular-nums text-gold-200">{formatPrice(totals.total)}</span>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-ivory">
          {copy.error}{" "}
          <a href={error} target="_blank" rel="noopener noreferrer" className="text-gold-200 underline underline-offset-4">
            {copy.errorWhatsapp}
          </a>
        </p>
      )}
      <button type="submit" data-cursor="order" disabled={sending} aria-busy={sending} className={cn(primaryClass, "mt-4")}>
        {label}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ivory-muted">{label}</dt>
      <dd className="tabular-nums text-ivory">{formatPrice(value)}</dd>
    </div>
  );
}

/** A wallet detail with an optional copy-to-clipboard button. */
function Detail({ label, value, copyText, large }: { label: string; value: string; copyText?: string; large?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyValue = async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch {
      // Clipboard blocked: the value is on screen to copy by hand.
    }
  };

  return (
    <div className="py-3">
      <dt className={labelClass}>{label}</dt>
      <dd className="mt-1 flex items-center justify-between gap-4">
        <span className={cn("min-w-0 tabular-nums text-ivory", large ? "font-display text-h3 tracking-[0.08em]" : "text-body-lg")}>
          {value}
        </span>
        {copyText && (
          <>
            <button
              type="button"
              onClick={copyValue}
              className="shrink-0 border border-gold-600 px-3 py-2 text-micro uppercase text-gold-200 transition-colors hover:border-gold-300"
            >
              {copied ? copy.pay.copied : copy.pay.copy}
              <span className="sr-only"> {label}</span>
            </button>
            <span role="status" className="sr-only">
              {copied ? copy.pay.copied : ""}
            </span>
          </>
        )}
      </dd>
    </div>
  );
}

type ScreenshotFieldProps = {
  screenshot: Screenshot | null;
  error: string | null;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (file: File | undefined) => void;
  onRemove: () => void;
};

/** Upload area for the payment screenshot: click or drop, then a preview with replace and remove. */
function ScreenshotField({ screenshot, error, onFile, onDrop, onRemove }: ScreenshotFieldProps) {
  const labelId = useId();
  const errorId = useId();
  const [dragging, setDragging] = useState(false);
  const input = (
    <input
      type="file"
      accept="image/*"
      onChange={onFile}
      aria-labelledby={labelId}
      aria-describedby={error ? errorId : undefined}
      aria-invalid={Boolean(error)}
      className="sr-only"
    />
  );

  const drop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    onDrop(event.dataTransfer.files[0]);
  };

  return (
    <div className="mt-10">
      <h3 id={labelId} className={headingClass}>
        {copy.screenshot.label}
      </h3>
      <p className="mt-2 text-sm text-ivory-muted">{copy.screenshot.hint}</p>

      {screenshot ? (
        <div className="mt-4 flex items-center gap-4 border border-line p-3">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden bg-ink-950">
            <Image src={screenshotUrl(screenshot)} alt={copy.screenshot.preview} fill unoptimized sizes="64px" className="object-cover object-top" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ivory">{screenshot.name}</p>
            <div className="mt-3 flex gap-5">
              <label className={cn(linkClass, "cursor-pointer has-focus-visible:text-gold-200 has-focus-visible:underline")}>
                {copy.screenshot.replace}
                {input}
              </label>
              <button type="button" onClick={onRemove} className={linkClass}>
                {copy.screenshot.remove}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
          className={cn(
            "mt-4 flex cursor-pointer flex-col items-center gap-3 border border-dashed px-6 py-8 text-center transition-colors hover:border-gold-300",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold-300",
            dragging ? "border-gold-300 bg-accent-soft" : "border-gold-600",
          )}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-gold-300" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-label uppercase text-gold-200">{copy.screenshot.choose}</span>
          {input}
        </label>
      )}

      {error && (
        <p id={errorId} role="alert" className="mt-3 text-sm text-ivory">
          {error}
        </p>
      )}
    </div>
  );
}
