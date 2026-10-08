import Link from "next/link";
import { Reveal } from "@/components/motion";

export type StartItem = { kicker: string; count: number; unit: string; text: string; cta: string; href: string };

// Dải "Bắt đầu từ đâu" 3 cột: lời kêu gọi + con số + liên kết (lấy ý tưởng từ "Be inspired / Get started / Find support" của st.com).
// Con số đếm thật từ các tab Google Sheet; nhóm nào chưa có dữ liệu thì tự ẩn.
export function HomeStartHere({ items }: { items: StartItem[] }) {
  const shown = items.filter((i) => i.count > 0);
  if (shown.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="start" style={{ "--cols": shown.length } as React.CSSProperties}>
            {shown.map((item) => (
              <Link key={item.kicker} href={item.href} className="start-col">
                <small>{item.kicker}</small>
                <b>{item.count}<em>+</em></b>
                <strong>{item.unit}</strong>
                <span>{item.text}</span>
                <i>{item.cta} <span aria-hidden="true">→</span></i>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
