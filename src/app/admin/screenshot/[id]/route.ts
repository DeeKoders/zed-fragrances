import { getScreenshot } from "@/lib/admin/orders";
import { isAdmin } from "@/lib/admin/session";

/** An order's payment screenshot, streamed from Drive through the orders script. Admins only. */
export async function GET(_request: Request, context: RouteContext<"/admin/screenshot/[id]">) {
  if (!(await isAdmin())) return new Response(null, { status: 404 });
  const { id } = await context.params;
  try {
    const { type, bytes } = await getScreenshot(id);
    return new Response(bytes, {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" },
    });
  } catch (error) {
    console.error(`[admin] Screenshot for ${id} failed.`, error);
    return new Response(null, { status: 502 });
  }
}
