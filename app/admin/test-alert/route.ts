import { NextResponse } from "next/server";
import { notify } from "@/lib/alert";

// Nút "Gửi cảnh báo thử" ở trang /admin. Nằm dưới /admin nên proxy.ts đã bắt mật khẩu.
// Basic Auth bị trình duyệt tự gửi kèm cả khi yêu cầu đến từ trang khác, nên còn kiểm tra thêm nguồn gốc (chống CSRF).
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  try {
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) return new NextResponse(null, { status: 403 });
  } catch { return new NextResponse(null, { status: 403 }); }
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new NextResponse(null, { status: 403 });

  const configured = Boolean(process.env.ALERT_WEBHOOK_URL);
  const sent = await notify({ title: "Gửi thử từ trang admin", detail: "Nếu bạn thấy tin này, kênh cảnh báo đang hoạt động.", fingerprint: "admin-test", level: "warn", force: true });
  return NextResponse.json({ configured, sent }, { headers: { "Cache-Control": "no-store" } });
}
