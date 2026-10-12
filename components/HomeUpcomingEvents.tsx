import Link from "next/link";
import type { EventItem } from "@/lib/dashboard-types";
import { todayInVietnam } from "@/lib/format";

// Khối "Sự kiện sắp tới" dạng thẻ ngày, lấy ý tưởng từ mục "Upcoming events" của st.com:
// khối ngày lớn bên trái, loại sự kiện + nơi diễn ra + tiêu đề bên phải.
// Chỉ nhận ngày dạng 2026-10-13 hoặc 13/10/2026; sự kiện không có ngày hợp lệ thì không lên thẻ.

type Parsed = { iso: string; day: string; month: string; year: string };

const MONTHS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

function parseDate(value: string): Parsed | null {
  const text = (value || "").trim();
  let y = "", m = "", d = "";
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) [, y, m, d] = match;
  else if ((match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) [, d, m, y] = match;
  else return null;
  const month = Number(m), day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { iso: `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, day: String(day).padStart(2, "0"), month: MONTHS[month - 1], year: y };
}

export type UpcomingEvent = { event: EventItem; date: Parsed };

/** Sự kiện từ hôm nay trở đi (giờ Việt Nam), gần nhất trước. */
export function upcomingEvents(events: EventItem[], limit = 3): UpcomingEvent[] {
  const today = todayInVietnam();
  return events
    .map((event) => ({ event, date: parseDate(event.date) }))
    .filter((entry): entry is UpcomingEvent => entry.date !== null && entry.date.iso >= today)
    .sort((a, b) => a.date.iso.localeCompare(b.date.iso))
    .slice(0, limit);
}

export function HomeUpcomingEvents({ items }: { items: UpcomingEvent[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="up-events">
      {items.map(({ event, date }, i) => {
        const external = /^https?:/.test(event.url || "");
        const href = event.url || "/events";
        const body = (
          <>
            <time className="up-date" dateTime={date.iso}>
              <span>{date.month}</span>
              <strong>{date.day}</strong>
              <small>{date.year}</small>
            </time>
            <div className="up-body">
              <div className="up-tags">
                {event.tag ? <span className="up-tag">{event.tag}</span> : null}
                {event.place ? <span className="up-place">{event.place}</span> : null}
                {event.time ? <span className="up-time">{event.time}</span> : null}
              </div>
              <h3>{event.title}</h3>
              {event.summary ? <p>{event.summary.length > 110 ? `${event.summary.slice(0, 109).trimEnd()}…` : event.summary}</p> : null}
            </div>
            <span className="up-go" aria-hidden="true">→</span>
          </>
        );
        return (
          <li key={`${event.title}-${i}`}>
            {external ? (
              <a className="up-card" href={href} target="_blank" rel="noopener noreferrer">{body}<span className="sr-only"> (mở tab mới)</span></a>
            ) : (
              <Link className="up-card" href={href}>{body}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
