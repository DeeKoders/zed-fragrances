import { brand } from "@/config/brand";

/**
 * Admin portal (/admin) settings and text. Kept apart from brand.ts, which ships to every visitor,
 * so nothing about the portal reaches the storefront's code.
 */
export const admin = {
  /** How long a sign-in lasts on a device. */
  sessionDays: 7,
  /** Order dates are shown in this time zone (also keeps server and browser output identical). */
  timeZone: "Asia/Karachi",

  copy: {
    title: "Orders",
    portal: "Admin",
    signIn: {
      title: "Sign in",
      password: "Password",
      submit: "Sign in",
      pending: "Signing in…",
      wrong: "That password isn't right.",
      notConfigured: "Sign-in is off: set ADMIN_PASSWORD in the environment variables, then redeploy.",
    },
    signOut: "Sign out",
    refresh: "Refresh",
    refreshing: "Refreshing…",
    viewStore: "View store",
    loading: "Loading orders…",
    loadError: "Couldn't load orders from the sheet.",
    loadErrorHint: "Make sure Code.gs is the latest version and published as a new version (google-apps-script/README.md).",
    search: "Search orders",
    searchPlaceholder: "Order ID, name, phone or city",
    filters: { action: "Needs action", all: "All" },
    empty: "No orders here.",
    select: "Select an order to see its details.",
    back: "All orders",
    order: {
      placed: "Placed",
      payment: "Payment",
      customer: "Customer",
      call: "Call",
      whatsapp: "WhatsApp",
      address: "Address",
      notes: "Notes",
      items: "Items",
      subtotal: "Subtotal",
      delivery: "Delivery",
      codFee: "COD charges",
      total: "Total",
      screenshot: "Payment screenshot",
      screenshotAlt: "Payment screenshot for order",
      screenshotLoading: "Loading screenshot…",
      screenshotError: "Couldn't load the screenshot.",
      openScreenshot: "Open full size",
    },
    actions: {
      verifyTitle: "Verify the payment",
      verifyHint: "Check that this amount arrived in your EasyPaisa / JazzCash account from this customer, then confirm.",
      confirmTitle: "Confirm the order",
      confirmHint: "Call or WhatsApp the customer to confirm the order, then mark it confirmed.",
      expected: "Expected",
      paymentReceived: "Payment received, confirm",
      confirm: "Confirm order",
      cancel: "Cancel order",
      cancelAsk: "Cancel this order?",
      cancelYes: "Yes, cancel it",
      cancelNo: "Keep it",
      saving: "Saving…",
      changed: "Marked as",
      undo: "Undo",
      error: "Couldn't update the sheet. Please try again.",
      notify: "Send confirmation on WhatsApp",
    },
  },

  /** Prefilled WhatsApp message to a customer whose order you've confirmed. */
  confirmMessage: (name: string, id: string) =>
    `Hi ${name}, your ${brand.name} order ${id} is confirmed. We'll let you know as soon as it's on its way. Thank you!`,
};
