"use client";

import Link from "next/link";
import { useDone } from "@/lib/saved";

// Tiến độ học lưu trong trình duyệt (cùng nguồn với ô "đã học" của từng bài).
// id bài = "<khóa học>:<nhánh>:<số bài>", chỉ tính các bài đã có link.

const short = (text: string, max = 44) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** Thanh tiến độ nhỏ ở đáy thẻ khóa học. Chưa học bài nào thì không hiện gì. */
export function CourseCardProgress({ ids }: { ids: string[] }) {
  const { done } = useDone();
  const count = ids.filter((id) => done.has(id)).length;
  if (ids.length === 0 || count === 0) return null;
  const complete = count === ids.length;
  return (
    <div className={`cp-card${complete ? " is-complete" : ""}`} aria-label={complete ? "Đã hoàn thành" : `Đã học ${count} trên ${ids.length} bài`}>
      <div className="cp-bar"><i style={{ width: `${Math.round((count / ids.length) * 100)}%` }} /></div>
      <span>{complete ? "✓ Hoàn thành" : `${count}/${ids.length} bài`}</span>
    </div>
  );
}

/** Dải tổng kết đầu trang Khóa học + nút "Học tiếp" tới khóa đang học dở. */
export function LearningSummary({ courses }: { courses: { slug: string; title: string; ids: string[] }[] }) {
  const { done } = useDone();
  const rows = courses.map((course) => ({ ...course, count: course.ids.filter((id) => done.has(id)).length }));
  const total = rows.reduce((sum, row) => sum + row.ids.length, 0);
  const learned = rows.reduce((sum, row) => sum + row.count, 0);
  if (total === 0 || learned === 0) return null;

  const finished = rows.filter((row) => row.ids.length > 0 && row.count === row.ids.length).length;
  const resume = rows.find((row) => row.count > 0 && row.count < row.ids.length);
  const percent = Math.round((learned / total) * 100);

  return (
    <div className="cp-summary" role="status">
      <div className="cp-summary-main">
        <strong>Tiến độ của bạn</strong>
        <div className="cp-bar"><i style={{ width: `${percent}%` }} /></div>
        <span>{learned}/{total} bài ({percent}%){finished > 0 ? ` · xong ${finished} khóa` : ""}</span>
      </div>
      {resume ? (
        <Link href={`/resources/courses/${resume.slug}`} className="btn secondary">Học tiếp: {short(resume.title, 32)}</Link>
      ) : null}
    </div>
  );
}

type Lesson = { id: string; title: string; url: string };

/** Nút chính của trang khóa học: Bắt đầu học / Học tiếp bài chưa xong / Học lại từ đầu. */
export function ResumeButton({ lessons }: { lessons: Lesson[] }) {
  const { done } = useDone();
  if (lessons.length === 0) return null;
  const next = lessons.find((lesson) => !done.has(lesson.id));
  const started = lessons.some((lesson) => done.has(lesson.id));
  const target = next ?? lessons[0];
  const label = !started ? "Bắt đầu học" : next ? `Học tiếp: ${short(next.title)}` : "Học lại từ đầu";
  return (
    <a className="btn" href={target.url} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="sr-only"> (mở tab mới)</span>
    </a>
  );
}

/** Công cụ cho cả nhánh: đánh dấu xong hết / đặt lại, và lời chúc khi hoàn thành. */
export function TrackTools({ ids }: { ids: string[] }) {
  const { done, setMany } = useDone();
  if (ids.length === 0) return null;
  const count = ids.filter((id) => done.has(id)).length;
  const complete = count === ids.length;

  return (
    <div className="cp-tools">
      {complete ? <p className="cp-congrats" role="status">✓ Bạn đã học hết {ids.length} bài của nhánh này. Chúc mừng!</p> : null}
      <span className="cp-tools-actions">
        {!complete ? <button type="button" className="link-reset" onClick={() => setMany(ids, true)}>Đánh dấu cả nhánh đã học</button> : null}
        {count > 0 ? (
          <button type="button" className="link-reset" onClick={() => window.confirm("Đặt lại tiến độ của nhánh này về 0?") && setMany(ids, false)}>
            Đặt lại tiến độ
          </button>
        ) : null}
      </span>
    </div>
  );
}
