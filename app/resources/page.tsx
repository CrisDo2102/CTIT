import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InventoryIcon } from "@/components/icons";

function DocumentIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>;
}
function CourseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M4 12h10M4 18h6" /><path d="m16 14 5 3-5 3Z" /></svg>;
}
export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero resources-home-hero">
          <div className="container">
            <p className="eyebrow">CTIT Resources</p>
            <h1>Tài nguyên</h1>
            <p className="lead">Một không gian chung cho mọi tài nguyên CTIT — từ kiến thức để học đến vật tư để làm.</p>
          </div>
        </section>

        <section className="section no-top">
          <div className="container">
            <div className="resources-directory">
              <Link href="/resources/documents" className="resource-hub-card">
                <div className="resource-hub-icon"><DocumentIcon /></div>
                <div className="resource-hub-copy">
                  <span className="type">01 / DOCUMENTS</span>
                  <h2>Tài liệu</h2>
                  <p>Sách, PDF, video, GitHub, website và các nguồn học tập — tìm kiếm và lọc trực tiếp từ Sheet.</p>
                  <span className="resource-hub-link">Khám phá tài liệu <b>→</b></span>
                </div>
              </Link>
              <Link href="/resources/inventory" className="resource-hub-card is-inventory">
                <div className="resource-hub-icon"><InventoryIcon /></div>
                <div className="resource-hub-copy">
                  <span className="type">02 / INVENTORY</span>
                  <h2>Inventory</h2>
                  <p>Linh kiện, vi điều khiển, module, công cụ và vật tư kỹ thuật — tra cứu số lượng, vị trí và trạng thái.</p>
                  <span className="resource-hub-link">Khám phá inventory <b>→</b></span>
                </div>
              </Link>
              <Link href="/resources/courses" className="resource-hub-card is-courses">
                <div className="resource-hub-icon"><CourseIcon /></div>
                <div className="resource-hub-copy">
                  <span className="type">03 / COURSES</span>
                  <h2>Khóa học</h2>
                  <p>Lộ trình học theo từng môn, bắt đầu từ vi điều khiển với hai nhánh AVR và ARM. Mỗi bài là một link, xếp theo thứ tự nên học.</p>
                  <span className="resource-hub-link">Xem khóa học <b>→</b></span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
