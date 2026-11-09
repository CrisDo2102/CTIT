import type { Metadata } from "next";
import { CourseCatalog } from "@/components/CourseCatalog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { getLearningPaths } from "@/lib/learning-paths";
import { getCourses } from "@/lib/sheet-data";
import "./courses.css";

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Lộ trình học theo từng môn của CTIT: mỗi bài là một link tới video, slide hoặc tài liệu."
};

export default async function CoursesPage() {
  const courses = await getCourses();
  const paths = await getLearningPaths(courses);
  const today = new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const lessonTotal = courses.reduce((sum, course) => sum + course.lessonCount, 0);

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          variant="compact"
          accent="resources"
          eyebrow="Resources / Courses"
          title="Khóa học"
          intro="Lộ trình học theo từng môn. Mỗi bài là một link dẫn thẳng tới video, slide hoặc tài liệu, xếp theo thứ tự nên học."
          parent={{ label: "Tài nguyên", href: "/resources" }}
          stats={[
            { value: courses.length, label: "môn học" },
            { value: lessonTotal, label: "bài" }
          ]}
        />

        <section className="section no-top">
          <div className="container">
            <CourseCatalog courses={courses} paths={paths} today={today} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
