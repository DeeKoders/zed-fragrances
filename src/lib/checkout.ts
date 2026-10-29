import { brand } from "@/config/brand";
import { getProduct } from "@/data/products";
import type { CartItem } from "@/stores/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "./format";

export type OrderLine = {
  product: Product;
  ml: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  inStock: boolean;
};

export type Order = {
  lines: OrderLine[];
  /** Sum of known prices. */
  total: number;
  /** True when any line is still "price on request" (price 0). */
  hasPriceOnRequest: boolean;
};

/** Resolves cart items against the catalogue; items whose product or size no longer exists are dropped. */
export function buildOrder(items: CartItem[]): Order {
  const lines = items.flatMap((item) => {
    const product = getProduct(item.slug);
    const size = product?.sizes.find((entry) => entry.ml === item.ml);
    if (!product || !size) return [];
    return [
      {
        product,
        ml: size.ml,
        quantity: item.quantity,
        unitPrice: size.price,
        lineTotal: size.price * item.quantity,
        inStock: size.inStock,
      },
    ];
  });
  return {
    lines,
    total: lines.reduce((total, line) => total + line.lineTotal, 0),
    hasPriceOnRequest: lines.some((line) => line.unitPrice === 0),
  };
}

/**
 * How the customer pays: "wallet" is EasyPaisa / JazzCash with a payment screenshot, "cod" is cash on
 * delivery. To plug in a gateway later, add a method here, its copy in brand.copy.checkout and its
 * option in CheckoutDialog.
 */
export type PaymentMethod = "wallet" | "cod";

export const paymentMethods: PaymentMethod[] = ["wallet", "cod"];

export type Customer = { name: string; phone: string; city: string; address: string; notes: string };

/** A payment screenshot, base64-encoded for the JSON request. */
export type Screenshot = { name: string; type: string; data: string };

/** What the browser sends to /api/orders. The server re-prices the items from the catalogue. */
export type OrderRequest = {
  items: CartItem[];
  customer: Customer;
  payment: PaymentMethod;
  screenshot: Screenshot | null;
};

export type OrderTotals = { subtotal: number; delivery: number; codFee: number; total: number };

/** Items plus delivery, plus the COD charge when paying cash on delivery. */
export function orderTotals(order: Order, payment: PaymentMethod): OrderTotals {
  const { deliveryFee, codFee } = brand.checkout;
  const cod = payment === "cod" ? codFee : 0;
  return { subtotal: order.total, delivery: deliveryFee, codFee: cod, total: order.total + deliveryFee + cod };
}

/** Extra charge shown on a payment option. */
export function paymentFee(payment: PaymentMethod) {
  return payment === "cod" ? brand.checkout.codFee : 0;
}

export function paymentLabel(payment: PaymentMethod) {
  return brand.copy.checkout[payment].label;
}

/** One line per item: "• Sovereign 30ml × 2: Rs 2,798". */
export function itemLines(order: Order) {
  return order.lines.map((line) => {
    const price = line.unitPrice > 0 ? formatPrice(line.lineTotal) : brand.copy.whatsapp.onRequest;
    return `• ${line.product.name} ${line.ml}ml × ${line.quantity}: ${price}`;
  });
}

/** Pakistani mobile numbers in any common form: 0300 1234567, +92 300 1234567, 0092-300-1234567, … */
export const PHONE_PATTERN = String.raw`[\s\-]*(\+|00)?(92)?[\s\-]*0?3([\s\-]*[0-9]){9}[\s\-]*`;

/** "0300-1234567" for anything PHONE_PATTERN accepts, otherwise null. */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^(?:00)?(?:92)?0?/, "");
  return /^3\d{9}$/.test(digits) ? `0${digits.slice(0, 3)}-${digits.slice(3)}` : null;
}

/** Fallback when an order can't be placed: the same order as a prefilled WhatsApp message. */
export function orderMessage(order: Order, payment: PaymentMethod, customer: Customer) {
  const copy = brand.copy;
  const totals = orderTotals(order, payment);
  const onRequest = order.hasPriceOnRequest ? ` (+ ${copy.whatsapp.onRequest})` : "";
  return [
    copy.whatsapp.greeting,
    "",
    ...itemLines(order),
    "",
    `${copy.cart.subtotal}: ${formatPrice(totals.subtotal)}`,
    `${copy.cart.delivery}: ${formatPrice(totals.delivery)}`,
    ...(totals.codFee > 0 ? [`${copy.checkout.codFee}: ${formatPrice(totals.codFee)}`] : []),
    `${copy.cart.total}: ${formatPrice(totals.total)}${onRequest}`,
    `${copy.checkout.payment}: ${paymentLabel(payment)}`,
    "",
    `${copy.checkout.name}: ${customer.name}`,
    `${copy.checkout.phone}: ${customer.phone}`,
    `${copy.checkout.city}: ${customer.city}`,
    `${copy.checkout.address}: ${customer.address}`,
    ...(customer.notes ? ["", customer.notes] : []),
  ].join("\n");
}

/** Sends the order to /api/orders, which records it in the orders sheet, and returns the order ID. */
export async function placeOrder(request: OrderRequest): Promise<string> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const result: unknown = await response.json().catch(() => null);
  const id = typeof result === "object" && result !== null && "id" in result ? result.id : null;
  if (!response.ok || typeof id !== "string") throw new Error(`Order failed (${response.status})`);
  return id;
}
