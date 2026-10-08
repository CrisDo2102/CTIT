import type { EventItem } from "@/lib/dashboard-types";

// Banner "Sự kiện nổi bật" (lấy ý tưởng từ banner "Special event" của st.com).
// Chỉ hiện khi trong tab Events có dòng đánh dấu featured.
export function HomeEventBanner({ event }: { event: EventItem }) {
  const external = /^https?:/.test(event.url || "");
  const href = event.url || "/events";
  const when = [event.date, event.time, event.place].filter(Boolean).join(" · ");
  return (
    <section className="ev-banner">
      {event.image ? <img className="ev-banner-bg" src={event.image} alt="" loading="lazy" /> : null}
      <div className="container ev-banner-inner">
        <p className="ti-eyebrow">{event.tag || "Sự kiện nổi bật"}</p>
        <h2>{event.title}</h2>
        {when ? <p className="ev-banner-when">{when}</p> : null}
        {event.summary ? <p className="ev-banner-text">{event.summary.length > 180 ? `${event.summary.slice(0, 179).trimEnd()}…` : event.summary}</p> : null}
        <a className="ti-cta" href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>Tìm hiểu thêm <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
