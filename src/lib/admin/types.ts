/** The Status column's values, in order. Keep in sync with STATUSES in google-apps-script/Code.gs. */
export const ORDER_STATUSES = ["New", "Verify payment", "Confirmed", "Dispatched", "Delivered", "Cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses that still need you: a payment to check (wallet) or an order to confirm (COD). */
export const ACTION_STATUSES: readonly string[] = ["Verify payment", "New"];

/** One row of the orders sheet, as the admin portal sees it. */
export type AdminOrder = {
  id: string;
  /** ISO 8601. */
  date: string;
  /** Usually an OrderStatus, but the sheet can hold anything typed into it. */
  status: string;
  payment: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  /** One line per item. */
  items: string;
  subtotal: number;
  delivery: number;
  codFee: number;
  total: number;
  /** True when a payment screenshot is linked from the row. */
  screenshot: boolean;
};

export const isOrderStatus = (value: unknown): value is OrderStatus => ORDER_STATUSES.some((status) => status === value);
