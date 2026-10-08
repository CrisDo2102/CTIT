import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { CourseProgress, LessonDone } from "@/components/LessonDone";
import { SafeImage } from "@/components/SafeImage";
import { SaveButton } from "@/components/SaveButton";
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
      <main id="main">
        <PageHero
          eyebrow="Resources / Courses"
          title={course.title}
          intro={course.description || undefined}
          parent={{ label: "Khóa học", href: "/resources/courses" }}
          aside={
            course.image ? (
              <div className="ph-cover">
                <SafeImage src={course.image} alt="" loading="eager" fallback={null} />
              </div>
            ) : undefined
          }
        >
          <SaveButton
            variant="pill"
            item={{ id: `khoa-hoc:${course.slug}`, kind: "Khóa học", title: course.title, sub: `${course.lessonCount} bài`, href: `/resources/courses/${course.slug}` }}
          />
        </PageHero>

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

            <CourseProgress ids={track.lessons.flatMap((lesson, index) => (lesson.url ? [`${course.slug}:${track.slug}:${index}`] : []))} />

            {groups.map((group, groupIndex) => (
              <section key={`${group.name}-${groupIndex}`} className="course-group">
                {group.name ? <h3>{group.name}</h3> : null}
                <ol className="course-lessons">
                  {group.items.map(({ lesson, no }) => (
                    <li key={`${lesson.title}-${no}`} className={lesson.url ? "has-done" : undefined}>
                      {lesson.url ? (
                        <>
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
                        <LessonDone id={`${course.slug}:${track.slug}:${no}`} title={lesson.title} />
                        </>
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
