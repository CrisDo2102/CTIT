import Link from "next/link";
import { contact } from "@/lib/site-config";

export type CoursePart = {
  slug: string;
  title: string;
  status: string;
  canInquire: boolean;
  quantity: number;
  unit: string;
};

export function CourseHardware({ parts, course, track }: {
  parts: CoursePart[] | null;
  course: string;
  track: string;
}) {
  return (
    <section className="classroom-materials">
      <h3>Vật tư liên quan đến {track || course}</h3>
      {parts === null ? <p>Chưa tải được dữ liệu kho. Bạn vẫn có thể tiếp tục học.</p> :
        parts.length === 0 ? <p>Chưa tìm thấy vật tư có mã trùng với đề cương nhánh này.</p> :
        <>
          <p>Các mục dưới đây có mã linh kiện xuất hiện trong đề cương. Xem yêu cầu của từng bài để biết cần chuẩn bị gì.</p>
          <ul className="course-parts">
            {parts.map(part => {
              const subject = encodeURIComponent(`Hỏi mượn ${part.title} cho môn ${course}`);
              const body = encodeURIComponent(`Chào CTIT,\r\nMình muốn hỏi mượn ${part.title} để học môn ${course}${track ? `, nhánh ${track}` : ""}.\r\nThời gian dự kiến: \r\nSố lượng cần: `);
              return <li key={part.slug}>
                <div><Link href={`/resources/inventory/${part.slug}`}>{part.title}</Link>
                  <small>{part.status} · Số lượng trong kho: {part.quantity} {part.unit}</small></div>
                {part.canInquire && <a href={`mailto:${contact.email}?subject=${subject}&body=${body}`}>Hỏi mượn qua email ↗</a>}
              </li>;
            })}
          </ul>
        </>}
      <Link href="/resources/inventory">Xem toàn bộ kho vật tư →</Link>
    </section>
  );
}
