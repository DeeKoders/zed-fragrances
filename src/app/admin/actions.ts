"use server";

import { refresh } from "next/cache";
import { admin } from "@/config/admin";
import { setOrderStatus } from "@/lib/admin/orders";
import { adminConfigured, endSession, isAdmin, passwordMatches, startSession } from "@/lib/admin/session";
import { isOrderStatus } from "@/lib/admin/types";

export type SignInState = { error: string | null };

/** Slows down password guessing. */
const FAILED_SIGN_IN_DELAY_MS = 1000;

export async function signIn(_previous: SignInState, form: FormData): Promise<SignInState> {
  if (!adminConfigured()) return { error: admin.copy.signIn.notConfigured };
  if (!passwordMatches(String(form.get("password") ?? ""))) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_SIGN_IN_DELAY_MS));
    return { error: admin.copy.signIn.wrong };
  }
  await startSession();
  refresh();
  return { error: null };
}

export async function signOut() {
  await endSession();
  refresh();
}

/** Changes an order's status in the sheet. Returns false when it couldn't. */
export async function updateOrderStatus(id: string, status: string): Promise<boolean> {
  if (!(await isAdmin()) || typeof id !== "string" || !id || !isOrderStatus(status)) return false;
  try {
    await setOrderStatus(id, status);
    return true;
  } catch (error) {
    console.error(`[admin] Couldn't set ${id} to ${status}.`, error);
    return false;
  }
}
