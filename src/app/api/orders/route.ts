import { brand } from "@/config/brand";
import {
  buildOrder,
  itemLines,
  normalizePhone,
  orderTotals,
  paymentLabel,
  paymentMethods,
  type Customer,
  type Screenshot,
} from "@/lib/checkout";
import { callOrdersScript, isRecord } from "@/lib/orders-script";
import { MAX_QUANTITY, type CartItem } from "@/stores/cart";

/** Base64 length of the largest screenshot accepted; MAX_UPLOAD in src/lib/screenshot.ts stays under it. */
const MAX_SCREENSHOT = 4_200_000;
const MAX_LINES = 20;
/** No 0/O or 1/I. 32 symbols, so every byte maps without bias. */
const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const text =(value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

function parseItem(value: unknown): CartItem | null {
  if (!isRecord(value)) return null;
  const { slug, ml, quantity } = value;
  if (typeof slug !== "string" || typeof ml !== "number") return null;
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null;
  return { slug, ml, quantity };
}

function parseItems(value: unknown) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_LINES) return null;
  const items = value.map(parseItem);
  return items.every((item): item is CartItem => item !== null) ? items : null;
}

function parseCustomer(value: unknown): Customer | null {
  if (!isRecord(value)) return null;
  const phone = normalizePhone(text(value.phone, 32));
  const customer = {
    name: text(value.name, 80),
    phone: phone ?? "",
    city: text(value.city, 60),
    address: text(value.address, 300),
    notes: text(value.notes, 500),
  };
  return customer.name && customer.phone && customer.city && customer.address ? customer : null;
}

function parseScreenshot(value: unknown): Screenshot | null {
  if (!isRecord(value)) return null;
  const { name, type, data } = value;
  if (typeof type !== "string" || !/^image\/[\w.+-]+$/.test(type)) return null;
  if (typeof data !== "string" || data.length === 0 || data.length > MAX_SCREENSHOT || !/^[A-Za-z0-9+/]+=*$/.test(data)) {
    return null;
  }
  return { name: text(name, 120) || "screenshot", type, data };
}

function orderId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${brand.shortName}-${Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join("")}`;
}

const fail = (error: string, status: number) => Response.json({ error }, { status });

/**
 * Places an order: validates it, re-prices it from the catalogue (the browser's totals are never
 * trusted) and records it in the orders Google Sheet through the Apps Script web app
 * (google-apps-script/Code.gs), which also stores the payment screenshot in Drive.
 * Needs ORDERS_SCRIPT_URL and ORDERS_SCRIPT_SECRET; see google-apps-script/README.md.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) return fail("invalid", 400);
  const items = parseItems(body.items);
  const customer = parseCustomer(body.customer);
  const payment = paymentMethods.find((method) => method === body.payment);
  const screenshot = payment === "wallet" ? parseScreenshot(body.screenshot) : null;
  if (!items || !customer || !payment || (payment === "wallet" && !screenshot)) return fail("invalid", 400);

  const order = buildOrder(items);
  if (order.lines.length !== items.length) return fail("invalid", 400);
  if (order.lines.some((line) => !line.inStock)) return fail("sold-out", 409);
  // A wallet payment needs a known amount to send.
  if (payment === "wallet" && order.hasPriceOnRequest) return fail("invalid", 400);

  const id = orderId();
  const totals = orderTotals(order, payment);

  try {
    await callOrdersScript("create", {
      order: {
        id,
        payment: paymentLabel(payment),
        customer,
        items: itemLines(order).join("\n"),
        currency: brand.currency,
        ...totals,
        screenshot,
      },
    });
  } catch (error) {
    console.error(`[orders] ${id} was not recorded.`, error);
    return fail("failed", 502);
  }

  return Response.json({ id });
}
