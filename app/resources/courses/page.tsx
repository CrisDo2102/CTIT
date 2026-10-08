import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { toneOf } from "@/lib/format";
import { getCourses } from "@/lib/sheet-data";
import "./courses.css";

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Lộ trình học theo từng môn của CTIT: mỗi bài là một link tới video, slide hoặc tài liệu."
};

export default async function CoursesPage() {
  const courses = await getCourses();
  const lessonTotal = courses.reduce((sum, course) => sum + course.lessonCount, 0);

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
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
            {courses.length === 0 ? (
              <p className="course-empty">Các khóa học đang được cập nhật. Quay lại sau nhé.</p>
            ) : (
              <div className="courses-grid">
                {courses.map((course) => (
                  <Link key={course.slug} href={`/resources/courses/${course.slug}`} className="course-card">
                    <div className="course-cover" style={{ "--tone": toneOf(course.title) } as React.CSSProperties}>
                      <SafeImage
                        src={course.image}
                        alt=""
                        loading="lazy"
                        fallback={<span className="course-cover-mark" aria-hidden="true">{course.title.slice(0, 2)}</span>}
                      />
                    </div>
                    <div className="course-body">
                      <h2>{course.title}</h2>
                      {course.description ? <p>{course.description}</p> : null}
                      <div className="course-tracks">
                        {course.tracks.length > 1 ? (
                          course.tracks.map((track) => (
                            <span key={track.slug} className="course-track-chip">
                              <strong>{track.name}</strong>
                              <em>{track.lessons.length} bài</em>
                            </span>
                          ))
                        ) : (
                          <span className="course-track-chip">
                            <strong>{course.lessonCount} bài</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
