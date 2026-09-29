import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentsShowcase } from "@/components/StudentsShowcase";
import { getStudents } from "@/lib/sheet-data";

export const dynamic = "force-dynamic";

export default async function SchoolsPage() {
  const students = await getStudents();
  return (
    <>
      <Header />
      <main>
        <section className="hero hero-compact">
          <div className="container">
            <p className="eyebrow">Schools & Departments</p>
            <h1>Trường & Khoa</h1>
            <p className="lead">Khám phá các trường, khoa và cộng đồng học viên đang đồng hành cùng CTIT.</p>
          </div>
        </section>
        <StudentsShowcase students={students} />
      </main>
      <Footer />
    </>
  );
}
