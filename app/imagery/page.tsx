import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { ImageryDirectory } from "@/components/ImageryDirectory";
import { getImageryCategories } from "@/lib/imagery";
import "./imagery.css";

export const metadata: Metadata = {
  title: "Imagery — Thư viện hình ảnh",
  description: "Thư viện ảnh CTIT được tự động tổ chức theo thư mục: Physics, Math và các lĩnh vực do CTIT tạo."
};

// Vercel tạo danh mục từ ảnh có trong source lúc build/redeploy.
export const dynamic = "force-static";

export default async function ImageryPage() {
  const categories = await getImageryCategories();
  const count = categories.reduce((sum, category) => sum + category.photos.length, 0);

  return (
    <>
      <Header />
      <main id="main" className="imagery-page">
        <PageHero
          variant="compact"
          accent="resources"
          eyebrow="CTIT / Resources / Imagery"
          title="Imagery"
          intro="Khám phá hình ảnh theo từng lĩnh vực. Danh mục được tạo tự động từ thư mục ảnh của CTIT, không cần cập nhật Google Sheets."
          parent={{ href: "/resources", label: "Tài nguyên" }}
          stats={[{ value: categories.length, label: "danh mục" }, { value: count, label: "hình ảnh" }]}
        />
        <section className="section no-top" aria-label="Thư viện hình ảnh">
          <div className="container">
            <ImageryDirectory categories={categories} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
