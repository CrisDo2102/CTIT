"use client";

import { useMemo, useState } from "react";
import { AddToCalendar } from "@/components/AddToCalendar";
import type { EventItem } from "@/lib/dashboard-types";
import { isIsoDate, monthCells } from "@/lib/calendar";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const CHIPS_PER_DAY = 2;

const ymOf = (iso: string) => ({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) });
const dayOf = (iso: string) => Number(iso.slice(8, 10));
const shortDate = (iso: string) => `${dayOf(iso)}/${ymOf(iso).month}`;

// Xem sự kiện theo lịch tháng (bắt đầu từ Thứ hai). Bấm một ngày để xem chi tiết; chưa chọn ngày thì
// khung bên dưới liệt kê mọi sự kiện của tháng đang xem. Sự kiện chưa có ngày hợp lệ không lên lịch.
export function EventsMonth({ items, today }: { items: EventItem[]; today: string }) {
  const byDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const item of items) {
      if (!isIsoDate(item.date)) continue;
      const list = map.get(item.date);
      if (list) list.push(item);
      else map.set(item.date, [item]);
    }
    return map;
  }, [items]);

  // Mở ở tháng hôm nay nếu tháng đó có sự kiện; không thì nhảy tới sự kiện sắp tới gần nhất (hoặc gần đây nhất).
  const [cursor, setCursor] = useState(() => {
    const dates = [...byDate.keys()].sort();
    const thisMonth = today.slice(0, 7);
    const pick = dates.some((d) => d.startsWith(thisMonth)) ? today : dates.find((d) => d >= today) ?? dates[dates.length - 1] ?? today;
    return ymOf(pick);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor]);
  const prefix = `${cursor.year}-${String(cursor.month).padStart(2, "0")}`;
  const inMonth = useMemo(() => [...byDate].filter(([date]) => date.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b)), [byDate, prefix]);
  const monthCount = inMonth.reduce((sum, [, list]) => sum + list.length, 0);

  const go = (delta: number) => {
    setSelected(null);
    setCursor(({ year, month }) => {
      const index = year * 12 + (month - 1) + delta;
      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });
  };
  const goToday = () => {
    setCursor(ymOf(today));
    setSelected(byDate.has(today) ? today : null);
  };

  const shownGroups = selected ? [[selected, byDate.get(selected) ?? []] as const] : inMonth;

  return (
    <div className="evc">
      <div className="evc-head">
        <h2 aria-live="polite">Tháng {cursor.month}/{cursor.year}</h2>
        <span className="evc-count">{monthCount} sự kiện</span>
        <div className="evc-nav">
          <button type="button" onClick={() => go(-1)} aria-label="Tháng trước">‹</button>
          <button type="button" className="evc-today" onClick={goToday}>Hôm nay</button>
          <button type="button" onClick={() => go(1)} aria-label="Tháng sau">›</button>
        </div>
      </div>

      <div className="evc-grid" role="group" aria-label={`Lịch tháng ${cursor.month}/${cursor.year}`}>
        {WEEKDAYS.map((name) => <span key={name} className="evc-dow" aria-hidden="true">{name}</span>)}
        {cells.map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} className="evc-cell is-blank" aria-hidden="true" />;
          const list = byDate.get(iso) ?? [];
          const cls = ["evc-cell", list.length ? "has-events" : "", iso === today ? "is-today" : "", iso < today ? "is-past" : "", iso === selected ? "is-selected" : ""].filter(Boolean).join(" ");
          return (
            <button
              key={iso}
              type="button"
              className={cls}
              disabled={list.length === 0}
              aria-pressed={iso === selected}
              aria-label={`${dayOf(iso)} tháng ${cursor.month}${iso === today ? " (hôm nay)" : ""}${list.length ? `, ${list.length} sự kiện` : ""}`}
              onClick={() => setSelected(iso === selected ? null : iso)}
            >
              <b>{dayOf(iso)}</b>
              {list.slice(0, CHIPS_PER_DAY).map((item, i) => <span key={i} className="evc-chip">{item.title}</span>)}
              {list.length > CHIPS_PER_DAY ? <span className="evc-more">+{list.length - CHIPS_PER_DAY}</span> : null}
              {list.length > 0 ? <span className="evc-dots" aria-hidden="true">{list.slice(0, 3).map((_, i) => <i key={i} />)}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="evc-panel">
        <div className="evc-panel-head">
          <h3>{selected ? `Ngày ${shortDate(selected)}` : `Tất cả sự kiện trong tháng ${cursor.month}`}</h3>
          {selected ? <button type="button" className="link-reset" onClick={() => setSelected(null)}>Xem cả tháng</button> : null}
        </div>
        {shownGroups.length === 0 ? <p className="ev-quiet">Tháng này chưa có sự kiện nào.</p> : null}
        <ul className="evc-list">
          {shownGroups.flatMap(([date, list]) =>
            list.map((item, i) => (
              <li key={`${date}-${i}`}>
                <time className="evc-when" dateTime={date}><b>{dayOf(date)}</b><small>Th{ymOf(date).month}</small></time>
                <div className="evc-what">
                  <strong>{item.title}</strong>
                  <span>{[item.time, item.place].filter(Boolean).join(" · ") || "Chưa có giờ và nơi"}</span>
                  {item.summary ? <p>{item.summary.length > 140 ? `${item.summary.slice(0, 139).trimEnd()}…` : item.summary}</p> : null}
                  <span className="evc-actions">
                    {item.url ? <a className="ev-link" href={item.url} target="_blank" rel="noopener noreferrer">Xem chi tiết<span aria-hidden="true"> ↗</span></a> : null}
                    {date >= today ? <AddToCalendar event={item} /> : null}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
