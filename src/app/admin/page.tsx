import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersBoard } from "@/components/admin/OrdersBoard";
import { SignInForm } from "@/components/admin/SignInForm";
import { admin } from "@/config/admin";
import { listOrders } from "@/lib/admin/orders";
import { adminConfigured, isAdmin } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: admin.copy.title,
  robots: { index: false, follow: false },
};

// Reads the session and the sheet on every request, so it can't be instant.
export const instant = false;

/** The admin portal: not linked from the site, kept out of search, and password protected. */
export default function AdminPage() {
  return (
    <Suspense fallback={<Status text={admin.copy.loading} />}>
      <Portal />
    </Suspense>
  );
}

async function Portal() {
  if (!(await isAdmin())) return <SignInForm configured={adminConfigured()} />;
  return (
    <Suspense fallback={<Status text={admin.copy.loading} />}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  const result = await listOrders().then(
    (orders) => ({ orders }),
    (error: unknown) => ({ error: String(error) }),
  );
  if ("error" in result) {
    console.error("[admin] Couldn't load orders.", result.error);
    return <Status text={admin.copy.loadError} hint={admin.copy.loadErrorHint} detail={result.error} />;
  }
  return <OrdersBoard orders={result.orders} fetchedAt={new Date().toISOString()} />;
}

function Status({ text, hint, detail }: { text: string; hint?: string; detail?: string }) {
  return (
    <div className="grid min-h-svh place-items-center px-4 py-16 text-center">
      <div className="max-w-md">
        <p role="status" className="text-label uppercase text-ivory-muted">
          {text}
        </p>
        {hint && <p className="mt-4 text-sm text-ivory">{hint}</p>}
        {detail && <p className="mt-4 break-words font-mono text-xs text-ivory-muted">{detail}</p>}
      </div>
    </div>
  );
}
