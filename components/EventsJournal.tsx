"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { EventItem } from "@/lib/dashboard-types";
import { formatDate } from "@/lib/format";
import "@/app/events/events.css";

type Props = {
  items: EventItem[];
  /** Hôm nay (YYYY-MM-DD, giờ VN) do máy chủ tính, để lần render đầu khớp với HTML. Sau khi tải xong sẽ đồng bộ theo giờ máy người xem. */
  today: string;
};

const PAGE_SIZE = 6;
const WEEKDAY_LONG = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

type Parsed = { year: number; month: number; day: number; weekday: number; ms: number };

// 2026-10-05 -> các phần của ngày. Định dạng khác (sheet tự đổi ngày) thì trả null và hiển thị nguyên văn.
function parseIso(value: string): Parsed | null {
  const m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]), weekday: date.getUTCDay(), ms: date.getTime() };
}

function localTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "Hôm nay", "Ngày mai", "Còn 12 ngày" (chỉ khi trong vòng 60 ngày, xa hơn thì bỏ vì không còn gợi nhắc gì).
function countdown(date: string, today: string): string {
  const a = parseIso(date);
  const b = parseIso(today);
  if (!a || !b) return "";
  const days = Math.round((a.ms - b.ms) / 86_400_000);
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Ngày mai";
  return days > 1 && days <= 60 ? `Còn ${days} ngày` : "";
}

const monthKey = (date: string) => {
  const p = parseIso(date);
  return p ? `${p.year}-${String(p.month).padStart(2, "0")}` : "";
};

function CalendarIcon() {
  return (
    <svg className="ev-ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="ev-ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg className="ev-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function EventsJournal({ items, today: serverToday }: Props) {
  const [today, setToday] = useState(serverToday);
  const [tag, setTag] = useState(""); // "" = Tất cả
  const [visible, setVisible] = useState(PAGE_SIZE); // số sự kiện đã diễn ra đang hiện
  const [open, setOpen] = useState<number | null>(null); // index trong mảng `past`
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Đồng bộ lại theo giờ máy người xem (trang được dựng sẵn có thể đã cũ vài phút).
  useEffect(() => setToday(localTodayIso()), []);

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

  // Chưa ghi ngày thì coi là "sắp diễn ra" (chưa chốt lịch) và xếp cuối.
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

  // Nổi bật: sự kiện đánh dấu featured (có ngày) trước, không thì sự kiện gần nhất.
  const feature = upcoming.find((item) => item.featured && item.date) ?? upcoming[0];
  const agenda = useMemo(() => {
    const groups = new Map<string, EventItem[]>();
    for (const item of upcoming) {
      if (item === feature) continue;
      const key = monthKey(item.date);
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups].map(([key, list]) => ({ key, list }));
  }, [upcoming, feature]);

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
  const pickTag = (key: string) => {
    setTag(key);
    setVisible(PAGE_SIZE);
  };

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

  const featureDate = feature ? parseIso(feature.date) : null;
  const featureCountdown = feature ? countdown(feature.date, today) : "";

  return (
    <section className="section no-top events-journal">
      <div className="container">
        {tags.length > 1 ? (
          <div className="ev-toolbar">
            <div className="type-chips" role="tablist" aria-label="Lọc sự kiện theo nhãn">
              <button type="button" role="tab" aria-selected={tag === ""} className={`chip ${tag === "" ? "is-active" : ""}`} onClick={() => pickTag("")}>
                Tất cả <em>{items.length}</em>
              </button>
              {tags.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={tag === entry.key}
                  className={`chip ${tag === entry.key ? "is-active" : ""}`}
                  onClick={() => pickTag(entry.key)}
                >
                  {entry.label} <em>{entry.count}</em>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {feature ? (
          <article className="ev-feature">
            <div className="ev-feature-body">
              <div className="ev-pills">
                <span className="ev-pill">Sự kiện tiếp theo</span>
                {featureCountdown ? <span className="ev-pill is-soft">{featureCountdown}</span> : null}
                {feature.tag ? <span className="ev-pill is-outline">{feature.tag}</span> : null}
              </div>
              <h2 className="ev-feature-title">{feature.title}</h2>
              <ul className="ev-facts">
                <li>
                  <CalendarIcon />
                  <span>{featureDate ? `${WEEKDAY_LONG[featureDate.weekday]}, ${formatDate(feature.date)}` : feature.date || "Chưa chốt lịch"}</span>
                </li>
                {feature.time ? (
                  <li>
                    <ClockIcon />
                    <span>{feature.time}</span>
                  </li>
                ) : null}
                {feature.place ? (
                  <li>
                    <PinIcon />
                    <span>{feature.place}</span>
                  </li>
                ) : null}
              </ul>
              {feature.summary ? <p className="ev-feature-sum">{feature.summary}</p> : null}
              {feature.url ? (
                <a className="ev-cta" href={feature.url} target="_blank" rel="noopener noreferrer">
                  Xem chi tiết / Đăng ký<span aria-hidden="true"> ↗</span>
                </a>
              ) : null}
            </div>
            <div className="ev-feature-media">
              <SafeImage
                src={feature.image}
                alt=""
                loading="eager"
                fallback={
                  <span className="ev-ph" aria-hidden="true">
                    {featureDate ? (
                      <>
                        <b>{String(featureDate.day).padStart(2, "0")}</b>
                        <small>Tháng {featureDate.month}</small>
                      </>
                    ) : (
                      <small>Sắp diễn ra</small>
                    )}
                  </span>
                }
              />
            </div>
          </article>
        ) : (
          <p className="ev-quiet">Chưa có sự kiện nào sắp diễn ra. Lịch mới sẽ được cập nhật tại đây.</p>
        )}

        {agenda.length > 0 ? (
          <section className="ev-section" aria-labelledby="ev-upcoming">
            <div className="ev-head">
              <h2 id="ev-upcoming">Lịch sắp tới</h2>
              <span>{upcoming.length - 1} sự kiện</span>
            </div>
            {agenda.map((group) => {
              const p = group.key ? parseIso(`${group.key}-01`) : null;
              return (
                <div className="ev-month" key={group.key || "tba"}>
                  <div className="ev-month-label">
                    {p ? (
                      <>
                        <b>Tháng {p.month}</b>
                        <small>{p.year}</small>
                      </>
                    ) : (
                      <b>Chưa chốt lịch</b>
                    )}
                  </div>
                  <div className="ev-rows">
                    {group.list.map((item, index) => {
                      const d = parseIso(item.date);
                      const left = countdown(item.date, today);
                      return (
                        <article key={`${item.title}-${index}`} className="ev-row">
                          <div className="ev-day">
                            {d ? (
                              <>
                                <b>{String(d.day).padStart(2, "0")}</b>
                                <small>{WEEKDAY_SHORT[d.weekday]}</small>
                              </>
                            ) : (
                              <small>Chưa rõ</small>
                            )}
                          </div>
                          <div className="ev-row-body">
                            {item.tag || left ? (
                              <div className="ev-pills">
                                {item.tag ? <span className="ev-pill is-outline">{item.tag}</span> : null}
                                {left ? <span className="ev-pill is-soft">{left}</span> : null}
                              </div>
                            ) : null}
                            <h3>{item.title}</h3>
                            {item.time || item.place ? (
                              <ul className="ev-meta">
                                {item.time ? (
                                  <li>
                                    <ClockIcon />
                                    {item.time}
                                  </li>
                                ) : null}
                                {item.place ? (
                                  <li>
                                    <PinIcon />
                                    {item.place}
                                  </li>
                                ) : null}
                              </ul>
                            ) : null}
                            {item.summary ? <p className="ev-row-sum">{item.summary}</p> : null}
                            {item.url ? (
                              <a className="ev-link" href={item.url} target="_blank" rel="noopener noreferrer">
                                Xem chi tiết / Đăng ký<span aria-hidden="true"> ↗</span>
                              </a>
                            ) : null}
                          </div>
                          {item.image ? (
                            <div className="ev-thumb">
                              <SafeImage src={item.image} alt="" loading="lazy" fallback={null} />
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        ) : null}

        {past.length > 0 ? (
          <section className="ev-section" aria-labelledby="ev-past">
            <div className="ev-head">
              <h2 id="ev-past">Đã diễn ra</h2>
              <span>{past.length} sự kiện</span>
            </div>
            <div className="ev-gallery">
              {past.slice(0, visible).map((item, index) => (
                <button
                  type="button"
                  key={`${item.title}-${index}`}
                  className="ev-tile"
                  onClick={(e) => openAt(index, e.currentTarget)}
                  aria-label={`Xem sự kiện: ${item.title}`}
                >
                  <span className="ev-tile-media">
                    <SafeImage
                      src={item.image}
                      alt=""
                      loading="lazy"
                      fallback={
                        <span className="ev-tile-empty" aria-hidden="true">
                          <CalendarIcon />
                        </span>
                      }
                    />
                  </span>
                  <span className="ev-tile-body">
                    <span className="ev-tile-date">{formatDate(item.date)}</span>
                    <span className="ev-tile-title">{item.title}</span>
                    {item.place ? <span className="ev-tile-place">{item.place}</span> : null}
                  </span>
                </button>
              ))}
            </div>
            {past.length > visible ? (
              <button type="button" className="ev-more" onClick={() => setVisible((n) => n + PAGE_SIZE)}>
                Xem thêm {Math.min(PAGE_SIZE, past.length - visible)} sự kiện
              </button>
            ) : null}
          </section>
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
              {current.url ? <a className="campus-link" href={current.url} target="_blank" rel="noopener noreferrer">Xem thêm ↗</a> : null}
              <span className="campus-lb-count">{(open ?? 0) + 1} / {past.length}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
