import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { ImageryGallery } from "@/components/ImageryGallery";
import { getImageryCategories, getImageryCategory } from "@/lib/imagery";
import "../imagery.css";

type Props = { params: Promise<{ category: string }> };

export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await getImageryCategories()).map((category) => ({ category: category.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: name } = await params;
  const category = await getImageryCategory(name);
  if (!category) return { title: "Không tìm thấy danh mục ảnh" };
  return {
    title: `${category.name} — Imagery`,
    description: `Xem ${category.photos.length} hình ảnh trong danh mục ${category.name} thuộc thư viện CTIT.`
  };
}

export default async function ImageryCategoryPage({ params }: Props) {
  const { category: name } = await params;
  const category = await getImageryCategory(name);
  if (!category) notFound();

  return (
    <>
      <Header />
      <main id="main" className="imagery-page">
        <PageHero
          variant="reading"
          accent="resources"
          eyebrow="CTIT / Imagery"
          title={category.name}
          intro={`Toàn bộ hình ảnh trong thư mục ${category.name}. Chọn một ảnh để xem phóng to hoặc tải bản gốc.`}
          parent={{ href: "/imagery", label: "Tất cả danh mục Imagery" }}
          stats={[{ value: category.photos.length, label: "hình ảnh" }]}
        />
        <section className="section no-top" aria-label={`Hình ảnh ${category.name}`}>
          <div className="container">
            <ImageryGallery category={category} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
