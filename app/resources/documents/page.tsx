import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { ResourceExplorer } from "@/components/ResourceExplorer";
import { getResources } from "@/lib/sheet-data";

export default async function DocumentsPage() {
  const resources = await getResources();
  const categoryCount = new Set(resources.map((r) => r.category).filter(Boolean)).size;
  const featuredCount = resources.filter((r) => r.featured).length;

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Resources / Documents"
          title="Tài liệu"
          intro="Sách, PDF, video, link học tập và tài liệu kỹ thuật."
          parent={{ label: "Tài nguyên", href: "/resources" }}
          stats={[
            { value: resources.length, label: "tài liệu" },
            { value: categoryCount, label: "lĩnh vực" },
            { value: featuredCount, label: "nổi bật" }
          ]}
        />

        <section className="section no-top">
          <div className="container">
            <ResourceExplorer initialResources={resources} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
