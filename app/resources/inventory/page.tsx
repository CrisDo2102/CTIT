import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { InventoryExplorer } from "@/components/InventoryExplorer";
import { withSlugs } from "@/lib/inventory";
import { getInventory } from "@/lib/sheet-data";

export default async function InventoryPage() {
  const items = withSlugs(await getInventory());
  const categories = new Set(items.map((item) => item.category).filter(Boolean)).size;

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Resources / Inventory"
          title="Inventory"
          intro="Linh kiện, vi điều khiển, module và vật tư kỹ thuật của CTIT."
          parent={{ label: "Tài nguyên", href: "/resources" }}
          stats={[
            { value: items.length, label: "mặt hàng" },
            { value: categories, label: "danh mục" },
            { value: items.reduce((sum, item) => sum + item.quantity, 0), label: "đơn vị" }
          ]}
          aside={
            <div className="ph-mark" aria-hidden="true">
              <span>INVENTORY</span><b>{String(items.length).padStart(2, "0")}</b><small>mặt hàng</small>
            </div>
          }
        />
        <section className="section no-top">
          <div className="container">
            <InventoryExplorer initialItems={items} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
