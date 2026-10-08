import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdmissionsInfo } from "@/lib/sheet-data";
import { AdmissionsView } from "./AdmissionsView";

// Không dùng PageShell: PageShell tự vẽ 1 banner "Admissions / Tuyển sinh / Các bước để tham gia CTIT."
// nên trước đây trang bị lặp tiêu đề 2 lần. Giờ chỉ còn đúng 1 hero, nằm trong AdmissionsView.
export default async function AdmissionsPage() {
  const data = await getAdmissionsInfo();

  return (
    <>
      <Header />
      <main id="main">
        <AdmissionsView data={data} />
      </main>
      <Footer />
    </>
  );
}
