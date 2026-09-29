import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InventoryExplorer } from "@/components/InventoryExplorer";
import { getInventory } from "@/lib/sheet-data";

export default async function InventoryPage() {
  const items = await getInventory();
  const categories = new Set(items.map((item) => item.category).filter(Boolean)).size;

  return (
    <>
      <Header />
      <main>
        <section className="page-hero inventory-page-hero">
          <div className="container">
            <div className="inventory-hero-layout">
              <div>
                <p className="eyebrow">Resources / Inventory</p>
                <h1>Inventory</h1>
              </div>
              <div className="inventory-hero-mark" aria-hidden="true">
                <span>INV</span><b>01</b>
              </div>
            </div>
            {items.length > 0 ? (
              <div className="resource-hero-stats">
                <span><strong>{items.length}</strong> mặt hàng</span>
                <span><strong>{categories}</strong> danh mục</span>
                <span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong> đơn vị</span>
              </div>
            ) : null}
          </div>
        </section>
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
