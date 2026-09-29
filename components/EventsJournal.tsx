"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { EventItem } from "@/lib/dashboard-types";

type Props = { items: EventItem[] };

// 2026-10-05 -> 05/10/2026. Dinh dang khac (sheet tu doi ngay) thi giu nguyen.
function formatDate(value: string): string {
  const m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? `${m[3].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[1]}` : value;
}

// 2026-10-05 -> { day: "05", month: "Thg 10" }, dung cho o so ngay kieu ve.
function dateBadge(value: string): { day: string; month: string } | null {
  const m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? { day: m[3].padStart(2, "0"), month: `Thg ${Number(m[2])}` } : null;
}

// Ngay hom nay dang YYYY-MM-DD theo gio may nguoi xem (client component),
// so sanh chuoi truc tiep voi cot date trong sheet de tach Sap dien ra / Da dien ra.
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const agendaMeta = (item: EventItem) => [item.time, item.place].filter(Boolean).join(" · ");
const heroMeta = (item: EventItem) => [formatDate(item.date), item.time, item.place].filter(Boolean).join(" · ");

export function EventsJournal({ items }: Props) {
  const [tag, setTag] = useState(""); // "" = Tất cả
  const [open, setOpen] = useState<number | null>(null); // index trong mang `past`
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const today = useMemo(() => todayIso(), []);

  // Gom tag không phân biệt hoa/thường, giữ thứ tự xuất hiện, đếm trên toàn bộ sự kiện.
  const tags = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const item of items) {
      const key = item.tag.toLowerCase();
      if (!key) continue;
      const entry = map.get(key);
      if (entry) entry.count += 1;
      else map.set(key, { label: item.tag, count: 1 });
    }
    return [...map].map(([key, value]) => ({ key, ...value }));
  }, [items]);

  const shown = useMemo(() => (tag ? items.filter((item) => item.tag.toLowerCase() === tag) : items), [items, tag]);

  // Chưa ghi ngày thì xếp vào "Sắp diễn ra" (chưa chốt lịch), đẩy xuống cuối danh sách.
  const upcoming = useMemo(
    () =>
      shown
        .filter((item) => !item.date || item.date >= today)
        .sort((a, b) => (a.date || "9999-99-99").localeCompare(b.date || "9999-99-99")),
    [shown, today]
  );
  const past = useMemo(
    () => shown.filter((item) => item.date && item.date < today).sort((a, b) => b.date.localeCompare(a.date)),
    [shown, today]
  );

  // Hero ưu tiên sự kiện sắp tới (featured trước, không thì gần nhất); không còn
  // sự kiện nào sắp tới thì lấy sự kiện gần nhất vừa diễn ra làm hero thay thế.
  const heroFromUpcoming = upcoming.length > 0;
  const heroPool = heroFromUpcoming ? upcoming : past;
  const hero = heroPool.find((item) => item.featured) ?? heroPool[0];

  const upcomingRest = heroFromUpcoming ? upcoming.filter((item) => item !== hero) : upcoming;
  const pastIndexed = past.map((item, index) => ({ item, index }));
  const pastGrid = heroFromUpcoming ? pastIndexed : pastIndexed.filter(({ item }) => item !== hero);
  const heroPastIndex = !heroFromUpcoming && hero ? past.indexOf(hero) : -1;

  const current = open === null ? null : past[open];
  const isOpen = current !== null && current !== undefined;

  const openAt = (index: number, el: HTMLElement) => {
    openerRef.current = el;
    setOpen(index);
  };
  const close = useCallback(() => {
    setOpen(null);
    openerRef.current?.focus();
  }, []);
  const step = useCallback(
    (delta: number) => setOpen((cur) => (cur === null ? cur : (cur + delta + past.length) % past.length)),
    [past.length]
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, step]);

  if (items.length === 0) {
    return (
      <section className="section no-top">
        <div className="container">
          <div className="empty-state">
            Chưa có dữ liệu. Kiểm tra biến môi trường <code>EVENTS_SHEET_CSV_URL</code> trong <code>.env.local</code> và
            tab Events (cột <code>title</code> bắt buộc).
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section no-top events-journal">
      <div className="container">
        {hero ? (
          <div className="event-hero">
            <SafeImage src={hero.image} alt="" fallback={null} loading="eager" />
            <span className="event-hero-shade" />
            <div className="event-hero-text">
              <span className="campus-badge">
                {heroFromUpcoming ? (hero.featured ? "Nổi bật · sắp diễn ra" : "Sắp diễn ra") : "Vừa diễn ra"}
              </span>
              {heroMeta(hero) ? <span className="event-hero-meta">{heroMeta(hero)}</span> : null}
              <span className="event-hero-title">{hero.title}</span>
              {hero.summary ? <span className="event-hero-summary">{hero.summary}</span> : null}
              {hero.url || heroPastIndex >= 0 ? (
                <span className="event-hero-actions">
                  {hero.url ? (
                    <a className="event-cta" href={hero.url} target="_blank" rel="noreferrer">
                      {heroFromUpcoming ? "Xem chi tiết / Đăng ký ↗" : "Xem thêm ↗"}
                    </a>
                  ) : null}
                  {heroPastIndex >= 0 ? (
                    <button
                      type="button"
                      className="event-cta is-ghost"
                      onClick={(e) => openAt(heroPastIndex, e.currentTarget)}
                    >
                      Xem ảnh lớn
                    </button>
                  ) : null}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {tags.length > 1 ? (
          <div className="campus-filter">
            <div className="type-chips" role="tablist" aria-label="Lọc sự kiện theo nhãn">
              <button type="button" role="tab" aria-selected={tag === ""} className={`chip ${tag === "" ? "is-active" : ""}`} onClick={() => setTag("")}>
                Tất cả <em>{items.length}</em>
              </button>
              {tags.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={tag === entry.key}
                  className={`chip ${tag === entry.key ? "is-active" : ""}`}
                  onClick={() => setTag(entry.key)}
                >
                  {entry.label} <em>{entry.count}</em>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {upcomingRest.length > 0 ? (
          <div className="event-block">
            <h3 className="event-block-title">Sắp diễn ra</h3>
            <div className="event-agenda">
              {upcomingRest.map((item, index) => {
                const badge = dateBadge(item.date);
                return (
                  <article key={`${item.title}-${index}`} className="event-card">
                    <div className="event-date-badge">
                      {badge ? (
                        <>
                          <span className="event-date-day">{badge.day}</span>
                          <span className="event-date-month">{badge.month}</span>
                        </>
                      ) : (
                        <span className="event-date-tba">Chưa có lịch</span>
                      )}
                    </div>
                    <div className="event-card-body">
                      {item.tag ? <span className="type">{item.tag}</span> : null}
                      <h4>{item.title}</h4>
                      {agendaMeta(item) ? <p className="event-card-meta">{agendaMeta(item)}</p> : null}
                      {item.summary ? <p className="event-card-summary">{item.summary}</p> : null}
                      {item.url ? (
                        <a className="event-cta" href={item.url} target="_blank" rel="noreferrer">
                          Xem chi tiết / Đăng ký ↗
                        </a>
                      ) : null}
                    </div>
                    {item.image ? (
                      <div className="event-card-photo">
                        <SafeImage src={item.image} alt={item.title} loading="lazy" fallback={null} />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {pastGrid.length > 0 ? (
          <div className="event-block">
            <h3 className="event-block-title">Đã diễn ra</h3>
            <div className="campus-grid">
              {pastGrid.map(({ item, index }, position) => {
                const big = position % 6 === 3;
                const right = big && Math.floor(position / 6) % 2 === 1;
                return (
                  <button
                    type="button"
                    key={`${item.title}-${index}`}
                    className={`campus-tile${big ? " is-big" : ""}${right ? " is-right" : ""}`}
                    onClick={(e) => openAt(index, e.currentTarget)}
                    aria-label={`Xem sự kiện: ${item.title}`}
                  >
                    <SafeImage src={item.image} alt={item.title} loading="lazy" fallback={<span className="campus-empty">Chưa có ảnh</span>} />
                    <span className="campus-tile-cap">
                      <span className="campus-tile-title">{item.title}</span>
                      <span className="campus-tile-date">{formatDate(item.date)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {current ? (
        <div className="campus-lb" role="dialog" aria-modal="true" aria-label={current.title} onClick={close}>
          <div className="campus-lb-card" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="campus-lb-close" onClick={close} aria-label="Đóng">×</button>
            <div className="campus-lb-stage">
              <SafeImage src={current.image} alt={current.title} fallback={<span className="campus-empty">Chưa có ảnh</span>} />
              {past.length > 1 ? (
                <>
                  <button type="button" className="campus-lb-nav is-prev" onClick={() => step(-1)} aria-label="Sự kiện trước">‹</button>
                  <button type="button" className="campus-lb-nav is-next" onClick={() => step(1)} aria-label="Sự kiện sau">›</button>
                </>
              ) : null}
            </div>
            <div className="campus-lb-note">
              <div className="campus-meta">
                {formatDate(current.date) ? <span>{formatDate(current.date)}</span> : null}
                {current.place ? <span>{current.place}</span> : null}
                {current.tag ? <span className="type">{current.tag}</span> : null}
              </div>
              <h3>{current.title}</h3>
              {current.summary ? <p>{current.summary}</p> : <p className="muted-note">Chưa có ghi chú cho sự kiện này.</p>}
              {current.url ? <a className="campus-link" href={current.url} target="_blank" rel="noreferrer">Xem thêm ↗</a> : null}
              <span className="campus-lb-count">{(open ?? 0) + 1} / {past.length}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
