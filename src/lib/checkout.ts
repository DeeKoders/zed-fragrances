import { brand } from "@/config/brand";
import { getProduct } from "@/data/products";
import type { CartItem } from "@/stores/cart";
import type { Product } from "@/types/product";
import { formatPrice } from "./format";
import { whatsappUrl } from "./whatsapp";

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

/** The prefilled WhatsApp message: items, sizes, quantities and the total in the configured currency. */
export function orderMessage(order: Order) {
  const copy = brand.copy.whatsapp;
  const lines = order.lines.map((line) => {
    const price = line.unitPrice > 0 ? formatPrice(line.lineTotal) : copy.onRequest;
    return `• ${line.product.name} ${line.ml}ml × ${line.quantity}: ${price}`;
  });
  const total = `${copy.total}: ${formatPrice(order.total)}${order.hasPriceOnRequest ? ` (+ ${copy.onRequest})` : ""}`;
  return [copy.greeting, "", ...lines, "", total, "", copy.footer].join("\n");
}

/**
 * Checkout behind one interface so a payment gateway can be added later: implement a provider and
 * pass it to `checkout` (or make it the default). WhatsApp is the only provider for now.
 */
export type CheckoutProvider = {
  id: string;
  checkout: (order: Order) => void | Promise<void>;
};

export const whatsappCheckout: CheckoutProvider = {
  id: "whatsapp",
  checkout: (order) => {
    window.open(whatsappUrl(orderMessage(order)), "_blank", "noopener,noreferrer");
  },
};

export function checkout(order: Order, provider: CheckoutProvider = whatsappCheckout) {
  if (order.lines.length === 0) return;
  return provider.checkout(order);
}
