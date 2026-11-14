import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { CourseClassroom } from "@/components/CourseClassroom";
import { SafeImage } from "@/components/SafeImage";
import { SaveButton } from "@/components/SaveButton";
import { matchesKeys, relatedKeys, statusKind, statusLabel, withSlugs } from "@/lib/inventory";
import { getImageryCategories } from "@/lib/imagery";
import { getCourses, getEvents, getInventory } from "@/lib/sheet-data";
import "../courses.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ track?: string | string[]; lesson?: string | string[] }>;
};

const loadCourse = cache(async (slug: string) => (await getCourses()).find((course) => course.slug === slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await loadCourse(slug);
  if (!course) return { title: "Khóa học" };
  return { title: `${course.title} | Khóa học`, description: course.description || undefined };
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { track: trackParam, lesson: lessonParam } = await searchParams;
  const course = await loadCourse(slug);
  if (!course) notFound();

  const wanted = Array.isArray(trackParam) ? trackParam[0] : trackParam;
  const track = course.tracks.find((item) => item.slug === wanted) ?? course.tracks[0];
  const outline = [course.title, course.description, track.name, track.description,
    ...track.lessons.flatMap(lesson => [lesson.group, lesson.title, lesson.description])].join(" ");
  const parts = await getInventory().then(items => withSlugs(items)
    .filter(item => matchesKeys(outline, relatedKeys(item)))
    .map(item => ({
      slug: item.slug, title: item.title, quantity: item.quantity, unit: item.unit,
      status: statusLabel(item.status),
      canInquire: item.quantity > 0 && ["ok", "low"].includes(statusKind(item.status))
    }))).catch(() => null);
  const [allCourses, albums, events] = await Promise.all([getCourses(), getImageryCategories(), getEvents()]);
  const prereqs=(course.info?.prerequisites||"").split(/[|,]/).map(s=>s.trim()).flatMap(slug=>allCourses.filter(c=>c.slug===slug && c.slug!==course.slug));
  const sameTitle=(value:string)=>value.trim().toLocaleLowerCase("vi")===course.title.trim().toLocaleLowerCase("vi");
  const album=albums.find(a=>sameTitle(a.name));
  const workshop=events.find(e=>sameTitle(e.title));
  const rawLesson = Array.isArray(lessonParam) ? lessonParam[0] : lessonParam;
  const parsedLesson = rawLesson === undefined ? undefined : Number(rawLesson);
  const initialLesson = parsedLesson !== undefined && Number.isInteger(parsedLesson) && parsedLesson >= 0 ? parsedLesson : undefined;

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          variant="reading"
          accent="resources"
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

            {(course.info?.teacher||course.info?.outcomes||course.info?.pending||course.info?.updated||prereqs.length>0||album||workshop)&&<aside className="course-facts">
              {course.info?.pending&&<strong>Khóa cần cập nhật. Kiểm tra phiên bản công cụ trước khi thực hành.</strong>}
              {course.info?.outcomes&&<p><b>Bạn sẽ học được</b><br/>{course.info.outcomes}</p>}
              {course.info?.teacher&&<p>Người hướng dẫn · {course.info.teacher}</p>}
              {course.info?.updated&&<p>Cập nhật · {course.info.updated.split("-").reverse().join("/")}</p>}
              {prereqs.length>0&&<p>Học trước: {prereqs.map(c=><Link key={c.slug} href={`/resources/courses/${c.slug}`}>{c.title} </Link>)}</p>}
              {workshop&&<p><Link href={workshop.url||"/events"}>Sự kiện liên quan · {workshop.title}</Link></p>}
              {album&&<Link href={album.href}>Xem ảnh buổi học →</Link>}
            </aside>}
            <CourseClassroom key={`${course.slug}:${track.slug}`} course={course} track={track} initialLesson={initialLesson} parts={parts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
