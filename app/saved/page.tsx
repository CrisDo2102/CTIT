import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { SavedList } from "@/components/SavedList";

export const metadata: Metadata = {
  title: "Đã lưu",
  description: "Vật tư, tài liệu và khóa học bạn đã lưu trên trình duyệt này.",
  robots: { index: false }
};

export default function SavedPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero eyebrow="Saved" title="Đã lưu" intro="Những mục bạn đã bấm ★. Danh sách nằm trong trình duyệt này, không cần đăng nhập." />
        <section className="section no-top">
          <div className="container">
            <SavedList />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
