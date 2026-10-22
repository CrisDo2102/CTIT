import type { Metadata } from "next";
import "./globals.css";
import "./extras.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import { RouteProgress } from "@/components/RouteProgress";
import { ErrorReporter } from "@/components/ErrorReporter";
import { ScrollUI } from "@/components/ScrollUI";
import { StickyOffsets } from "@/components/StickyOffsets";
import { ToastHost } from "@/components/ToastHost";

export const metadata: Metadata = {
  title: { default: "CTIT", template: "%s · CTIT" },
  description: "Cổng thông tin CTIT."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <a className="skip-link" href="#main">Bỏ qua tới nội dung</a>
        {children}
        <ScrollUI />
        <StickyOffsets />
        <ToastHost />
        <ErrorReporter />
        {/* Đo tốc độ người dùng thật (Core Web Vitals). Chỉ chạy trên Vercel; bật trong Vercel -> Speed Insights. Không dùng cookie. */}
        {process.env.NEXT_PUBLIC_ON_VERCEL ? <SpeedInsights /> : null}
      </body>
    </html>
  );
}
