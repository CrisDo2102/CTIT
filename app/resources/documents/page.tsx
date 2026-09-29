import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ResourceExplorer } from "@/components/ResourceExplorer";
import { getResources } from "@/lib/sheet-data";

export default async function DocumentsPage() {
  const resources = await getResources();
  const categoryCount = new Set(resources.map((r) => r.category).filter(Boolean)).size;
  const featuredCount = resources.filter((r) => r.featured).length;

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className="container">
            <p className="eyebrow">Resources / Documents</p>
            <h1>Tài liệu</h1>
            <p className="lead">
              Sách, PDF, video, link học tập và tài liệu kỹ thuật.
            </p>
            {resources.length > 0 ? (
              <div className="resource-hero-stats">
                <span><strong>{resources.length}</strong> tài liệu</span>
                {categoryCount > 0 ? <span><strong>{categoryCount}</strong> lĩnh vực</span> : null}
                {featuredCount > 0 ? <span><strong>{featuredCount}</strong> nổi bật</span> : null}
              </div>
            ) : null}
          </div>
        </section>

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
