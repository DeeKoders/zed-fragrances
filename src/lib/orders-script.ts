import "server-only";

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/**
 * Calls the orders Apps Script web app (google-apps-script/Code.gs) with the shared secret and
 * returns its JSON answer; throws if it isn't configured or answers with an error.
 * Needs ORDERS_SCRIPT_URL and ORDERS_SCRIPT_SECRET; see google-apps-script/README.md.
 */
export async function callOrdersScript(action: string, data: Record<string, unknown> = {}) {
  const url = process.env.ORDERS_SCRIPT_URL;
  const secret = process.env.ORDERS_SCRIPT_SECRET;
  if (!url || !secret) throw new Error("ORDERS_SCRIPT_URL or ORDERS_SCRIPT_SECRET is not set.");

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, action, ...data }),
    signal: AbortSignal.timeout(25_000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok || !isRecord(result) || result.ok !== true) {
    throw new Error(`Apps Script answered ${response.status}: ${isRecord(result) ? String(result.error) : "not JSON"}`);
  }
  return result;
}
