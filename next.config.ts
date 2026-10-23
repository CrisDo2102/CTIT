import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// Ép https (upgrade-insecure-requests) chỉ khi chạy trên Vercel. Chạy `npm start` thử ở http://localhost mà bật mục này
// thì một số trình duyệt (Safari...) đổi luôn CSS/JS sang https và trang vỡ.
const forceHttps = Boolean(process.env.VERCEL);

// Content-Security-Policy: chỉ cho tải tài nguyên từ nơi cần thiết.
// - script 'unsafe-inline': Next.js chèn script nội tuyến; muốn bỏ phải dùng nonce (khi đó mọi trang
//   thành render động, mất cache). Đổi lại: object-src/base-uri/form-action/frame-ancestors khoá chặt.
// - img-src https: vì ảnh lấy cả từ Google Drive, imgur... theo link trong Sheet.
// - frame-src: chỉ Spline (hero trang Nghiên cứu).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src https://my.spline.design https://prod.spline.design",
  "script-src-attr 'none'",
  "object-src 'none'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(forceHttps ? ["upgrade-insecure-requests"] : [])
].join("; ");

// Thời điểm máy chủ dựng (giờ Việt Nam), hiện ở chân trang để biết đang chạy đúng bản mới.
// Lúc `npm run dev` là giờ bật server; lúc `npm run build` là giờ build.
const buildStamp = new Date().toLocaleString("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const nextConfig: NextConfig = {
  // Bản build dùng dữ liệu mẫu (kiểm thử có dữ liệu) nằm ở thư mục riêng để không lẫn với bản build thường.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BUILD_STAMP: buildStamp, NEXT_PUBLIC_ON_VERCEL: process.env.VERCEL ? "1" : "" },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : [])
        ]
      },
      {
        source: "/api/report",
        headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex" }]
      },
      {
        // Ảnh trong public/images: Next mặc định bắt trình duyệt hỏi lại máy chủ ở MỌI lần tải trang (max-age=0).
        // Giữ 1 ngày và cho dùng bản cũ thêm 7 ngày trong lúc tải bản mới ngầm. Tên file không có mã băm nên KHÔNG đặt "immutable":
        // thay ảnh cùng tên thì người xem có thể còn thấy ảnh cũ tối đa 1 ngày.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }]
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" }
        ]
      }
    ];
  }
};

export default nextConfig;
