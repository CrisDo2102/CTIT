import type { Metadata } from "next";
import { AdminGuide } from "@/components/AdminGuide";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { guides } from "@/lib/admin-guide";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

// Luôn render theo từng request (không đóng băng lúc build) để link CSV và
// kiểm tra mật khẩu ở proxy.ts luôn chạy trên dữ liệu hiện tại.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  // Link CSV nam trong .env.local (chi doc duoc o server) -> truyen xuong component client.
  const csv = Object.fromEntries(guides.map((g) => [g.key, process.env[g.env] ?? ""]));
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Content studio"
          title="Admin"
          intro="Nội dung web lấy từ Google Sheet, mỗi trang một tab. Không có form nhập tay: sửa trực tiếp tab tương ứng, trang này chỉ để tra cách điền, đúng tên cột và lấy link CSV của từng tab."
        />
        <section className="section no-top">
          <AdminGuide csv={csv} />
        </section>
      </main>
      <Footer />
    </>
  );
}
