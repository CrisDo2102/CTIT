import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { TypeIcon } from "@/components/ResourceCard";
import type { CourseLesson } from "@/lib/dashboard-types";
import { padIndex } from "@/lib/format";
import { getCourses } from "@/lib/sheet-data";
import "../courses.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ track?: string | string[] }>;
};

const loadCourse = cache(async (slug: string) => (await getCourses()).find((course) => course.slug === slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) return { title: "Khóa học" };
  return { title: `${course.title} | Khóa học`, description: course.description || undefined };
}

// Gom các bài liên tiếp có cùng "group" (chương). Số thứ tự chạy liền qua các chương.
function groupLessons(lessons: CourseLesson[]) {
  const groups: { name: string; items: { lesson: CourseLesson; no: number }[] }[] = [];
  lessons.forEach((lesson, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === lesson.group) {
      last.items.push({ lesson, no: index });
    } else {
      groups.push({ name: lesson.group, items: [{ lesson, no: index }] });
    }
  });
  return groups;
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { track: trackParam } = await searchParams;
  const course = await loadCourse(slug);
  if (!course) notFound();

  const wanted = Array.isArray(trackParam) ? trackParam[0] : trackParam;
  const track = course.tracks.find((item) => item.slug === wanted) ?? course.tracks[0];
  const groups = groupLessons(track.lessons);
  const firstLink = track.lessons.find((lesson) => lesson.url)?.url;

  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <div className={`container course-hero${course.image ? " has-cover" : ""}`}>
            <div className="course-hero-text">
              <p className="eyebrow">Resources / Courses</p>
              <h1>{course.title}</h1>
              {course.description ? <p className="lead">{course.description}</p> : null}
              <Link href="/resources/courses" className="course-back">← Tất cả khóa học</Link>
            </div>
            {course.image ? (
              <div className="course-hero-cover">
                <SafeImage src={course.image} alt="" loading="eager" fallback={null} />
              </div>
            ) : null}
          </div>
        </section>

        <section className="section no-top">
          <div className="container">
            {course.tracks.length > 1 ? (
              <nav className="course-nav" aria-label="Chọn nhánh học">
                {course.tracks.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/resources/courses/${course.slug}?track=${item.slug}`}
                    scroll={false}
                    className={`chip${item.slug === track.slug ? " is-active" : ""}`}
                    aria-current={item.slug === track.slug ? "true" : undefined}
                  >
                    {item.name} <em>{item.lessons.length}</em>
                  </Link>
                ))}
              </nav>
            ) : null}

            {track.name || track.description || firstLink ? (
              <div className="course-track-head">
                <div>
                  {track.name ? <h2>{track.name}</h2> : null}
                  {track.description ? <p>{track.description}</p> : null}
                </div>
                {firstLink ? (
                  <a className="btn" href={firstLink} target="_blank" rel="noopener noreferrer">
                    Bắt đầu học<span className="sr-only"> (mở tab mới)</span>
                  </a>
                ) : null}
              </div>
            ) : null}

            {groups.map((group, groupIndex) => (
              <section key={`${group.name}-${groupIndex}`} className="course-group">
                {group.name ? <h3>{group.name}</h3> : null}
                <ol className="course-lessons">
                  {group.items.map(({ lesson, no }) => (
                    <li key={`${lesson.title}-${no}`}>
                      {lesson.url ? (
                        <a className="course-lesson" href={lesson.url} target="_blank" rel="noopener noreferrer">
                          <span className="course-lesson-no">{padIndex(no)}</span>
                          <span className="course-lesson-main">
                            <strong>{lesson.title}</strong>
                            {lesson.description ? <span>{lesson.description}</span> : null}
                          </span>
                          <span className="course-lesson-meta">
                            <span className="course-lesson-type">
                              <TypeIcon type={lesson.type} />
                              {lesson.type}
                            </span>
                            <span className="sr-only">(mở tab mới)</span>
                          </span>
                        </a>
                      ) : (
                        <div className="course-lesson is-soon">
                          <span className="course-lesson-no">{padIndex(no)}</span>
                          <span className="course-lesson-main">
                            <strong>{lesson.title}</strong>
                            {lesson.description ? <span>{lesson.description}</span> : null}
                          </span>
                          <span className="course-lesson-meta">
                            <span className="course-lesson-soon">Sắp có</span>
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
