import { BodyTooLargeError, readLimitedText } from "@/lib/limited-body";
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
  // A browser's error beacon is a same-origin request. Validate against the actual request URL,
  // not a potentially spoofable Host header. In production require an Origin as an anti-CSRF layer.
  const origin = request.headers.get("origin");
  if (!origin && process.env.NODE_ENV === "production") return new NextResponse(null, { status: 403 });
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) return new NextResponse(null, { status: 403 });
    } catch { return new NextResponse(null, { status: 403 }); }
  }
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) return new NextResponse(null, { status: 403 });
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType && !/^application\/json(?:\s*;|$)/i.test(contentType)) return new NextResponse(null, { status: 415 });

  if (!limiter.allow(clientIp(request.headers))) {
    return new NextResponse(null, { status: 429, headers: { "Retry-After": "600" } });
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return new NextResponse(null, { status: 413 });
  let raw: string;
  try { raw = await readLimitedText(request, MAX_BYTES); }
  catch (error) {
    if (error instanceof BodyTooLargeError) return new NextResponse(null, { status: 413 });
    return new NextResponse(null, { status: 400 });
  }

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
  if (!type || !TYPES.has(type) || !message || !path || !/^\/(?![\/\\])[^?#\u0000-\u001f]*$/.test(path)) return new NextResponse(null, { status: 400 });
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
