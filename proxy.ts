import { NextResponse, type NextRequest } from "next/server";

// Khoá trang /admin bằng HTTP Basic Auth (trình duyệt tự hiện hộp nhập mật khẩu).
// - Mật khẩu lấy từ biến môi trường ADMIN_PASSWORD (tên đăng nhập nhập gì cũng được).
// - Chạy thật (production) mà chưa đặt ADMIN_PASSWORD: chặn hẳn, không bao giờ để mở.
// - Chạy dev (npm run dev) mà chưa đặt: cho vào để tiện sửa.

function safeEqual(a: string, b: string): boolean {
  // So sánh không dừng sớm, để không lộ độ dài phần đúng qua thời gian phản hồi.
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function readPassword(header: string | null): string | null {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const colon = decoded.indexOf(":");
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD ?? "";

  if (!expected) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("Trang admin đang tắt: chưa đặt ADMIN_PASSWORD trên máy chủ.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
    });
  }

  const given = readPassword(request.headers.get("authorization"));
  if (given !== null && safeEqual(given, expected)) {
    return NextResponse.next();
  }

  return new NextResponse("Cần mật khẩu để vào trang admin.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="CTIT Admin", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"]
};
