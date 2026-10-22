import { NextResponse } from "next/server";
import { notify } from "@/lib/alert";
import { logEvent } from "@/lib/log";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Nhận báo lỗi từ trình duyệt (xem lib/report-client.ts). Đây là điểm công khai nên phòng thủ chặt:
// cùng nguồn gốc, nhỏ (4 KB), có kiểm tra từng trường, tối đa 20 báo cáo / 10 phút / IP, và cảnh báo ra ngoài còn bị giới hạn riêng (lib/alert.ts).
export const dynamic = "force-dynamic";

const limiter = createRateLimiter(20, 10 * 60 * 1000);
const MAX_BYTES = 4096;
const TYPES = new Set(["error", "unhandledrejection", "boundary"]);

const text = (value: unknown, max: number): string | undefined => (typeof value === "string" && value.length <= max ? value : undefined);

export async function POST(request: Request) {
  // Chặn trang khác (kể cả trình duyệt của người lạ) gửi báo lỗi giả vào hệ thống của mình.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.get("host")) return new NextResponse(null, { status: 403 });
    } catch {
      return new NextResponse(null, { status: 403 });
    }
  }
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "same-site", "none"].includes(site)) return new NextResponse(null, { status: 403 });

  if (!limiter.allow(clientIp(request.headers))) {
    return new NextResponse(null, { status: 429, headers: { "Retry-After": "600" } });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return new NextResponse(null, { status: 413 });
  const raw = await request.text();
  if (raw.length > MAX_BYTES) return new NextResponse(null, { status: 413 });

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!data || typeof data !== "object") return new NextResponse(null, { status: 400 });
  const body = data as Record<string, unknown>;

  const type = text(body.type, 30);
  const message = text(body.message, 300);
  const path = text(body.path, 200);
  if (!type || !TYPES.has(type) || !message || !path || !path.startsWith("/")) return new NextResponse(null, { status: 400 });
  const stack = text(body.stack, 800);
  const digest = text(body.digest, 64);

  logEvent("error", "client_error", { type, message, path, stack, digest });
  await notify({
    title: `Lỗi trên trình duyệt: ${message.slice(0, 120)}`,
    detail: `Trang ${path}${digest ? `\nMã lỗi: ${digest}` : ""}`,
    fingerprint: `client:${path}:${message.slice(0, 80)}`
  });
  return new NextResponse(null, { status: 204 });
}
