import { AdminGuide } from "@/components/AdminGuide";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { guides } from "@/lib/admin-guide";

export default function AdminPage() {
  // Link CSV nam trong .env.local (chi doc duoc o server) -> truyen xuong component client.
  const csv = Object.fromEntries(guides.map((g) => [g.key, process.env[g.env] ?? ""]));
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <p className="eyebrow">Content studio</p>
            <h1>Admin</h1>
            <p className="lead">
              Nội dung web lấy từ Google Sheet, mỗi trang một tab. Không có form nhập tay: sửa trực tiếp tab tương ứng,
              trang này chỉ để tra cách điền, đúng tên cột và lấy link CSV của từng tab.
            </p>
          </div>
        </section>
        <section className="section no-top">
          <AdminGuide csv={csv} editUrl={process.env.SHEET_EDIT_URL ?? ""} />
        </section>
      </main>
      <Footer />
    </>
  );
}
