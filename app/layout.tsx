import type { Metadata } from "next";
import "./globals.css";
import { ScrollUI } from "@/components/ScrollUI";

export const metadata: Metadata = {
  title: "CTIT",
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
        <a className="skip-link" href="#main">Bỏ qua tới nội dung</a>
        {children}
        <ScrollUI />
      </body>
    </html>
  );
}
