import { NextResponse, type NextRequest } from "next/server";

// Khoá trang /admin bằng HTTP Basic Auth (trình duyệt tự hiện hộp nhập mật khẩu).
// - Tên đăng nhập từ ADMIN_USERNAME (mặc định "admin"), mật khẩu lấy từ ADMIN_PASSWORD.
// - Production mà thiếu hoặc mật khẩu quá ngắn (< 20 ký tự): khoá admin (fail closed).
// - Dev chưa đặt: chỉ cho vào trên localhost (không mở qua LAN).
// - Chống dò mật khẩu: sai 5 lần liên tiếp từ cùng một IP thì khoá 15 phút (HTTP 429).
//   Bộ đếm nằm trong bộ nhớ từng instance nên là lớp chặn "best effort" trên serverless;
//   mật khẩu dài là lớp chính. Cần chặn tuyệt đối thì bật Vercel Firewall rate limit cho /admin.

const MIN_PASSWORD_LENGTH = 20;
// Mật khẩu mẫu / dễ đoán (vd "change-this-to-a-long-password" trong .env.example): ở production thì tắt /admin thay vì để mở với mật khẩu ai cũng đoán được.
const PLACEHOLDER_PASSWORD = /^(?:change|your[-_ ]?|password|passw0rd|admin|test|example|12345|qwerty)/i;
const OBVIOUS_PASSWORD = /^(?:[0-9]+|([a-zA-Z0-9])\1+)$/;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; until: number; last: number }>();

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

// So sánh hai chuỗi qua hash SHA-256 (độ dài cố định) và không dừng sớm,
// nên không lộ độ dài hay phần đúng của mật khẩu qua thời gian phản hồi.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function readCredentials(header: string | null): { username: string; password: string } | null {
  // Reject oversized/malformed Basic credentials before decoding, and never log them.
  if (!header || header.length > 4096 || !/^Basic [A-Za-z0-9+/]+={0,2}$/.test(header)) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const colon = decoded.indexOf(":");
    if (colon <= 0 || /[\u0000-\u001f\u007f]/.test(decoded)) return null;
    return { username: decoded.slice(0, colon), password: decoded.slice(colon + 1) };
  } catch {
    return null;
  }
}

function clientIp(request: NextRequest): string {
  // Vercel controls x-vercel-forwarded-for; do not trust arbitrary client supplied forwarding chains there.
  const forwarded = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : request.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}

function prune(now: number) {
  if (fails.size < 500) return;
  for (const [ip, entry] of fails) {
    if (entry.until < now && now - entry.last > LOCK_MS) fails.delete(ip);
  }
  // Giữ bộ nhớ có trần: quá 5000 IP thì xoá bớt phần cũ nhất.
  if (fails.size > 5000) {
    for (const ip of [...fails.keys()].slice(0, fails.size - 5000)) fails.delete(ip);
  }
}

const baseHeaders = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

export async function proxy(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const production = process.env.NODE_ENV === "production";

  if (!expected) {
    if (!production && ["localhost", "127.0.0.1", "[::1]"].includes(request.nextUrl.hostname)) return NextResponse.next();
    return new NextResponse("Trang admin đang tắt: chưa đặt ADMIN_PASSWORD trên máy chủ.", { status: 503, headers: baseHeaders });
  }
  if (production && (PLACEHOLDER_PASSWORD.test(expected) || OBVIOUS_PASSWORD.test(expected))) {
    return new NextResponse("Trang admin đang tắt: ADMIN_PASSWORD vẫn là giá trị mẫu. Hãy đặt một chuỗi ngẫu nhiên dài.", { status: 503, headers: baseHeaders });
  }
  if (production && expected.length < MIN_PASSWORD_LENGTH) {
    return new NextResponse(`Trang admin đang tắt: ADMIN_PASSWORD phải dài ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`, { status: 503, headers: baseHeaders });
  }

  const ip = clientIp(request);
  const now = Date.now();
  prune(now);
  const record = fails.get(ip);
  if (record && record.until > now) {
    return new NextResponse("Thử sai quá nhiều lần. Vui lòng quay lại sau ít phút.", {
      status: 429,
      headers: { ...baseHeaders, "Retry-After": String(Math.ceil((record.until - now) / 1000)) }
    });
  }

  const given = readCredentials(request.headers.get("authorization"));
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  if (given !== null && (await Promise.all([safeEqual(given.username, expectedUser), safeEqual(given.password, expected)])).every(Boolean)) {
    fails.delete(ip);
    return NextResponse.next();
  }

  // Chỉ tính là "sai" khi người dùng thật sự gửi mật khẩu (lần đầu mở trang chưa có header thì không tính).
  if (given !== null) {
    const count = (record?.count ?? 0) + 1;
    fails.set(ip, { count: count >= MAX_FAILS ? 0 : count, until: count >= MAX_FAILS ? now + LOCK_MS : 0, last: now });
  }

  return new NextResponse("Cần mật khẩu để vào trang admin.", {
    status: 401,
    headers: { ...baseHeaders, "WWW-Authenticate": 'Basic realm="CTIT Admin", charset="UTF-8"' }
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
