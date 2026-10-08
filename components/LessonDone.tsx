"use client";

import { useDone } from "@/lib/saved";

// Ô "đã học" cho từng bài (lưu trong trình duyệt). id = "<khóa học>:<nhánh>:<số bài>".
export function LessonDone({ id, title }: { id: string; title: string }) {
  const { done, toggle } = useDone();
  const checked = done.has(id);
  return (
    <label className={`lesson-done${checked ? " is-done" : ""}`} title={checked ? "Bỏ đánh dấu đã học" : "Đánh dấu đã học"}>
      <input type="checkbox" checked={checked} onChange={() => toggle(id)} aria-label={`Đã học: ${title}`} />
      <span aria-hidden="true">{checked ? "✓" : ""}</span>
    </label>
  );
}

// Thanh tiến độ của một nhánh học: "Đã học 3/12".
export function CourseProgress({ ids }: { ids: string[] }) {
  const { done } = useDone();
  const count = ids.filter((id) => done.has(id)).length;
  if (ids.length === 0) return null;
  const percent = Math.round((count / ids.length) * 100);
  return (
    <div className="course-progress" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={count} aria-label="Tiến độ học">
      <div className="course-progress-bar"><i style={{ width: `${percent}%` }} /></div>
      <span>Đã học {count}/{ids.length}</span>
    </div>
  );
}
