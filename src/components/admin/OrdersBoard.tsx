"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { signOut, updateOrderStatus } from "@/app/admin/actions";
import { Logo } from "@/components/ui/Logo";
import { admin } from "@/config/admin";
import { brand } from "@/config/brand";
import { ACTION_STATUSES, ORDER_STATUSES, isOrderStatus, type AdminOrder, type OrderStatus } from "@/lib/admin/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

const copy = admin.copy;

type Filter = "action" | "all" | OrderStatus;
type Change = { id: string; from: string; to: OrderStatus };

const dateFormat = new Intl.DateTimeFormat(brand.locale, { dateStyle: "medium", timeStyle: "short", timeZone: admin.timeZone });

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date);
};

/** 0300-1234567 → 923001234567 for tel: and wa.me links. */
const internationalPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
};

const whatsappTo = (phone: string, message?: string) =>
  `https://wa.me/${internationalPhone(phone)}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

const matches = (order: AdminOrder, filter: Filter) =>
  filter === "all" ? true : filter === "action" ? ACTION_STATUSES.includes(order.status) : order.status === filter;

const primaryClass =
  "inline-flex items-center justify-center bg-gold-300 px-5 py-3 text-label uppercase text-ink-950 transition-colors hover:bg-gold-200 disabled:cursor-wait disabled:opacity-60";
const secondaryClass =
  "inline-flex items-center justify-center border border-line px-5 py-3 text-label uppercase text-ivory transition-colors hover:border-gold-300 hover:text-gold-200 disabled:cursor-wait disabled:opacity-60";
const barButtonClass = "px-3 py-2 text-micro uppercase text-ivory-muted transition-colors hover:text-gold-200 disabled:opacity-60";

/**
 * The admin portal's orders view: filter chips and search over the sheet's orders, and a detail
 * panel to check payment screenshots and confirm or cancel orders. Status changes are written to
 * the sheet straight away and shown here without reloading; Refresh pulls the sheet again.
 */
export function OrdersBoard({ orders, fetchedAt }: { orders: AdminOrder[]; fetchedAt: string }) {
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [filter, setFilter] = useState<Filter>("action");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Statuses changed since the last load; dropped once a refresh brings the sheet's own values.
  const [changes, setChanges] = useState<{ at: string; statuses: Record<string, OrderStatus> }>({ at: fetchedAt, statuses: {} });
  const [lastChange, setLastChange] = useState<Change | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const list = useMemo(() => {
    const statuses = changes.at === fetchedAt ? changes.statuses : {};
    return orders.map((order) => (statuses[order.id] ? { ...order, status: statuses[order.id] } : order));
  }, [orders, changes, fetchedAt]);

  const filters = useMemo(() => {
    const count = (key: Filter) => list.filter((order) => matches(order, key)).length;
    const statuses = ORDER_STATUSES.map((status) => ({ key: status as Filter, label: status, count: count(status) }));
    return [
      { key: "action" as Filter, label: copy.filters.action, count: count("action") },
      ...statuses.filter((entry) => entry.count > 0),
      { key: "all" as Filter, label: copy.filters.all, count: list.length },
    ];
  }, [list]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    const digits = text.replace(/\D/g, "");
    return list.filter(
      (order) =>
        matches(order, filter) &&
        (!text ||
          [order.id, order.name, order.city].some((value) => value.toLowerCase().includes(text)) ||
          (digits.length > 2 && order.phone.replace(/\D/g, "").includes(digits))),
    );
  }, [list, filter, query]);

  const selected = list.find((order) => order.id === selectedId) ?? null;

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
    setError(null);
  }, []);
  const close = useCallback(() => select(null), [select]);

  /** Writes a status to the sheet. An undo puts the previous status back and clears the "Marked as" note. */
  const changeStatus = (order: AdminOrder, to: OrderStatus, undo = false) => {
    setError(null);
    startSaving(async () => {
      if (!(await updateOrderStatus(order.id, to))) {
        setError(copy.actions.error);
        return;
      }
      setChanges((current) => ({
        at: fetchedAt,
        statuses: { ...(current.at === fetchedAt ? current.statuses : {}), [order.id]: to },
      }));
      setLastChange(undo ? null : { id: order.id, from: order.status, to });
    });
  };

  return (
    <div className="min-h-svh">
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
          <Logo href={null} sizes="80px" eager className="w-20" />
          <span className="text-micro uppercase text-ivory-muted">{copy.portal}</span>
          <div className="ml-auto flex items-center">
            <button type="button" disabled={refreshing} onClick={() => startRefresh(() => router.refresh())} className={barButtonClass}>
              {refreshing ? copy.refreshing : copy.refresh}
            </button>
            <a href="/" target="_blank" rel="noopener" className={cn(barButtonClass, "hidden sm:inline-block")}>
              {copy.viewStore}
            </a>
            <form action={signOut}>
              <button type="submit" className={barButtonClass}>
                {copy.signOut}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-h2 uppercase">{copy.title}</h1>
          <label className="block w-full sm:w-80">
            <span className="sr-only">{copy.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="block w-full border border-line bg-ink-950/60 px-4 py-3 text-body text-ivory transition-colors placeholder:text-ivory-muted/60 focus:border-gold-300 focus:outline-none"
            />
          </label>
        </div>

        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {filters.map((entry) => (
            <button
              key={entry.key}
              type="button"
              aria-pressed={filter === entry.key}
              onClick={() => setFilter(entry.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 border px-4 py-2 text-micro uppercase transition-colors",
                filter === entry.key ? "border-gold-300 bg-gold-300 text-ink-950" : "border-line text-ivory hover:border-gold-600",
              )}
            >
              {entry.label}
              <span className="tabular-nums opacity-70">{entry.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
          <section aria-label={copy.title}>
            {visible.length === 0 ? (
              <p className="border border-dashed border-line px-6 py-16 text-center text-sm text-ivory-muted">{copy.empty}</p>
            ) : (
              <ul className="grid gap-3">
                {visible.map((order) => (
                  <li key={order.id}>
                    <OrderRow order={order} active={order.id === selectedId} onSelect={() => select(order.id)} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {selected ? (
            <OrderDetail
              key={selected.id}
              order={selected}
              saving={saving}
              error={error}
              lastChange={lastChange?.id === selected.id ? lastChange : null}
              onStatus={(to) => changeStatus(selected, to)}
              onUndo={(to) => changeStatus(selected, to, true)}
              onClose={close}
            />
          ) : (
            <aside className="hidden border border-dashed border-line px-6 py-16 text-center text-sm text-ivory-muted lg:sticky lg:top-6 lg:block">
              {copy.select}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, active, onSelect }: { order: AdminOrder; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "block w-full border p-4 text-left transition-colors",
        active ? "border-gold-300 bg-ink-900" : "border-line hover:border-gold-600 hover:bg-ink-900/60",
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block font-display text-lg tracking-[0.08em] text-ivory">{order.id}</span>
          <span className="mt-0.5 block truncate text-sm text-ivory">
            {order.name}
            {order.city && <span className="text-ivory-muted"> · {order.city}</span>}
          </span>
        </span>
        <StatusBadge status={order.status} />
      </span>
      <span className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-ivory-muted">
          {formatDate(order.date)} · {order.payment}
        </span>
        <span className="shrink-0 tabular-nums text-gold-200">{formatPrice(order.total)}</span>
      </span>
    </button>
  );
}

const badgeClass: Record<string, string> = {
  "Verify payment": "bg-gold-300 text-ink-950",
  New: "border border-gold-300 text-gold-200",
  Confirmed: "bg-ink-700 text-gold-200",
  Dispatched: "bg-ink-700 text-ivory",
  Delivered: "bg-ink-700 text-ivory-muted",
  Cancelled: "border border-line text-ivory-muted line-through",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("shrink-0 whitespace-nowrap px-2 py-1 text-micro uppercase", badgeClass[status] ?? "border border-line text-ivory")}>
      {status}
    </span>
  );
}

type OrderDetailProps = {
  order: AdminOrder;
  saving: boolean;
  error: string | null;
  lastChange: Change | null;
  onStatus: (status: OrderStatus) => void;
  onUndo: (status: OrderStatus) => void;
  /** Stable: it's an effect dependency. */
  onClose: () => void;
};

/** One order: what to do next, the payment screenshot, the customer and the items. A full-screen sheet on phones. */
function OrderDetail({ order, saving, error, lastChange, onStatus, onUndo, onClose }: OrderDetailProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [askCancel, setAskCancel] = useState(false);
  const verifying = order.status === "Verify payment";
  const undoTo = lastChange && isOrderStatus(lastChange.from) ? lastChange.from : null;

  // Keyed by order: focus moves here when an order opens.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  let action: ReactNode = null;
  if (lastChange) {
    action = (
      <>
        <p className="text-sm text-ivory">
          {copy.actions.changed} <StatusBadge status={lastChange.to} />
          {undoTo && (
            <button
              type="button"
              disabled={saving}
              onClick={() => onUndo(undoTo)}
              className="ml-3 text-micro uppercase text-ivory-muted underline underline-offset-4 hover:text-gold-200"
            >
              {saving ? copy.actions.saving : copy.actions.undo}
            </button>
          )}
        </p>
        {lastChange.to === "Confirmed" && <NotifyLink order={order} />}
      </>
    );
  } else if (verifying || order.status === "New") {
    action = (
      <>
        <h3 className="text-label uppercase text-gold-200">{verifying ? copy.actions.verifyTitle : copy.actions.confirmTitle}</h3>
        <p className="mt-2 text-sm text-ivory-muted">{verifying ? copy.actions.verifyHint : copy.actions.confirmHint}</p>
        {verifying && (
          <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
            <span className="text-micro uppercase text-ivory-muted">{copy.actions.expected}</span>
            <span className="font-display text-h3 tabular-nums text-gold-200">{formatPrice(order.total)}</span>
          </p>
        )}
        {askCancel ? (
          <div className="mt-5">
            <p className="text-sm text-ivory">{copy.actions.cancelAsk}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" disabled={saving} onClick={() => onStatus("Cancelled")} className={primaryClass}>
                {saving ? copy.actions.saving : copy.actions.cancelYes}
              </button>
              <button type="button" disabled={saving} onClick={() => setAskCancel(false)} className={secondaryClass}>
                {copy.actions.cancelNo}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={saving} onClick={() => onStatus("Confirmed")} className={primaryClass}>
              {saving ? copy.actions.saving : verifying ? copy.actions.paymentReceived : copy.actions.confirm}
            </button>
            <button type="button" disabled={saving} onClick={() => setAskCancel(true)} className={secondaryClass}>
              {copy.actions.cancel}
            </button>
          </div>
        )}
      </>
    );
  } else if (order.status === "Confirmed") {
    action = <NotifyLink order={order} />;
  }

  return (
    <aside
      aria-labelledby={`order-${order.id}`}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink-950 px-4 pb-10 pt-4 lg:sticky lg:bottom-auto lg:left-auto lg:right-auto lg:top-6 lg:z-auto lg:max-h-[calc(100svh-3rem)] lg:border lg:border-line lg:bg-ink-900 lg:p-6"
    >
      <button type="button" onClick={onClose} className="mb-4 py-2 text-micro uppercase text-ivory-muted hover:text-gold-200 lg:hidden">
        ← {copy.back}
      </button>

      <div className="flex items-start justify-between gap-3">
        <h2 ref={heading} id={`order-${order.id}`} tabIndex={-1} className="font-display text-h3 tracking-[0.08em] outline-none">
          {order.id}
        </h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-ivory-muted">
        {copy.order.placed} {formatDate(order.date)} · {order.payment}
      </p>

      {action && <div className="mt-6 border border-gold-700 bg-ink-950/60 p-5">{action}</div>}
      {error && (
        <p role="alert" className="mt-3 text-sm text-ivory">
          {error}
        </p>
      )}

      {order.screenshot && <Screenshot id={order.id} />}

      <Section title={copy.order.customer}>
        <p className="text-body-lg text-ivory">{order.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="tabular-nums text-ivory">{order.phone}</span>
          <a href={`tel:+${internationalPhone(order.phone)}`} className="text-micro uppercase text-gold-200 underline-offset-4 hover:underline">
            {copy.order.call}
          </a>
          <a
            href={whatsappTo(order.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-micro uppercase text-gold-200 underline-offset-4 hover:underline"
          >
            {copy.order.whatsapp}
          </a>
        </p>
        <p className="mt-4 text-micro uppercase text-ivory-muted">{copy.order.address}</p>
        <p className="mt-1 whitespace-pre-line text-sm text-ivory">
          {order.address}
          {order.city && `, ${order.city}`}
        </p>
        {order.notes && (
          <>
            <p className="mt-4 text-micro uppercase text-ivory-muted">{copy.order.notes}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-ivory">{order.notes}</p>
          </>
        )}
      </Section>

      <Section title={copy.order.items}>
        <p className="whitespace-pre-line text-sm text-ivory">{order.items}</p>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <Amount label={copy.order.subtotal} value={order.subtotal} />
          <Amount label={copy.order.delivery} value={order.delivery} />
          <Amount label={copy.order.codFee} value={order.codFee} />
          <div className="flex justify-between gap-4 pt-2">
            <dt className="text-label uppercase text-ivory-muted">{copy.order.total}</dt>
            <dd className="font-display text-h3 tabular-nums text-gold-200">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t border-line pt-6">
      <h3 className="mb-3 text-label uppercase text-gold-200">{title}</h3>
      {children}
    </section>
  );
}

function Amount({ label, value }: { label: string; value: number }) {
  if (value <= 0) return null;
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ivory-muted">{label}</dt>
      <dd className="tabular-nums text-ivory">{formatPrice(value)}</dd>
    </div>
  );
}

function NotifyLink({ order }: { order: AdminOrder }) {
  return (
    <a
      href={whatsappTo(order.phone, admin.confirmMessage(order.name, order.id))}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(primaryClass, "mt-4 w-full")}
    >
      {copy.actions.notify}
    </a>
  );
}

/** The payment screenshot, loaded through the admin-only screenshot route. */
function Screenshot({ id }: { id: string }) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const src = `/admin/screenshot/${encodeURIComponent(id)}`;

  return (
    <Section title={copy.order.screenshot}>
      <a href={src} target="_blank" rel="noopener" className="relative block aspect-[9/16] w-full max-w-64 overflow-hidden border border-line bg-ink-900">
        {state !== "loaded" && (
          <span className="absolute inset-0 grid place-items-center px-4 text-center text-micro uppercase text-ivory-muted">
            {state === "failed" ? copy.order.screenshotError : copy.order.screenshotLoading}
          </span>
        )}
        <Image
          src={src}
          alt={`${copy.order.screenshotAlt} ${id}`}
          fill
          unoptimized
          sizes="16rem"
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
          className={cn("object-contain transition-opacity", state === "loaded" ? "opacity-100" : "opacity-0")}
        />
      </a>
      <a href={src} target="_blank" rel="noopener" className="mt-3 inline-block text-micro uppercase text-gold-200 underline-offset-4 hover:underline">
        {copy.order.openScreenshot}
      </a>
    </Section>
  );
}
