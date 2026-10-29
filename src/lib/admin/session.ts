import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { admin } from "@/config/admin";

const COOKIE = "zed_admin";
/** The cookie only goes to the portal and its screenshot route. */
const COOKIE_PATH = "/admin";
const MAX_AGE = admin.sessionDays * 24 * 60 * 60;

/** True when ADMIN_PASSWORD is set; without it nobody can sign in. */
export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD && process.env.ORDERS_SCRIPT_SECRET);

/**
 * Signing key for the session cookie, from both secrets: changing ADMIN_PASSWORD (or the script
 * secret) signs everyone out.
 */
function signingKey() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ORDERS_SCRIPT_SECRET;
  if (!password || !secret) return null;
  return createHmac("sha256", secret).update(`admin-session:${password}`).digest();
}

const sign = (payload: string, key: Buffer) => createHmac("sha256", key).update(payload).digest("base64url");
const digest = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time password check. */
export function passwordMatches(input: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && timingSafeEqual(digest(input), digest(password ?? ""));
}

/** Signs the admin in on this device: a signed, httpOnly cookie holding only its expiry. */
export async function startSession() {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD or ORDERS_SCRIPT_SECRET is not set.");
  const expires = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { path: COOKIE_PATH, maxAge: 0 });
}

/** Whether this request comes from a signed-in admin. Call it in every admin page, action and route. */
export async function isAdmin() {
  const key = signingKey();
  const value = (await cookies()).get(COOKIE)?.value;
  if (!key || !value) return false;
  const [expires = "", signature = ""] = value.split(".");
  if (!(Number(expires) > Date.now())) return false;
  const expected = Buffer.from(sign(expires, key));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
