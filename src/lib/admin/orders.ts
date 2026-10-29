import "server-only";

import { callOrdersScript, isRecord } from "@/lib/orders-script";
import type { AdminOrder, OrderStatus } from "./types";

const text = (value: unknown) => (value == null ? "" : String(value));
const amount = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

function toOrder(row: Record<string, unknown>): AdminOrder {
  return {
    id: text(row.id),
    date: text(row.date),
    status: text(row.status),
    payment: text(row.payment),
    name: text(row.name),
    phone: text(row.phone),
    city: text(row.city),
    address: text(row.address),
    notes: text(row.notes),
    items: text(row.items),
    subtotal: amount(row.subtotal),
    delivery: amount(row.delivery),
    codFee: amount(row.codFee),
    total: amount(row.total),
    screenshot: row.screenshot === true,
  };
}

/** Every order in the sheet, newest first. */
export async function listOrders(): Promise<AdminOrder[]> {
  const result = await callOrdersScript("list");
  if (!Array.isArray(result.orders)) throw new Error("Apps Script returned no order list. Is Code.gs up to date?");
  return result.orders.filter(isRecord).map(toOrder);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await callOrdersScript("status", { id, status });
}

/** The order's payment screenshot. */
export async function getScreenshot(id: string) {
  const result = await callOrdersScript("screenshot", { id });
  if (typeof result.type !== "string" || typeof result.data !== "string") throw new Error("Apps Script returned no image.");
  return { type: result.type, bytes: Buffer.from(result.data, "base64") };
}
