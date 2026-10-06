"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { CampusItem } from "@/lib/dashboard-types";
import "@/app/campus/campus.css";
import { formatDate } from "@/lib/format";

type Props = { items: CampusItem[] };

// 2026-09-20 -> 20/09/2026. Định dạng khác (sheet tự đổi ngày) thì giữ nguyên.
const metaLine = (item: CampusItem) => [formatDate(item.date), item.place].filter(Boolean).join(" · ");

function monthKey(date: string): string {
  const m = date.match(/^(\d{4})-(\d{1,2})/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}` : "";
}

function monthLabel(key: string): string {
  if (!key) return "Chưa rõ ngày";
  const [year, month] = key.split("-");
  return `Tháng ${Number(month)}, ${year}`;
}

type Entry = { item: CampusItem; idx: number };

export function CampusJournal({ items }: Props) {
  const [tag, setTag] = useState(""); // "" = Tất cả, còn lại là tag viết thường
  const [open, setOpen] = useState<number | null>(null); // index trong `flat`
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef(0);

  // Gom tag không phân biệt hoa/thường, giữ thứ tự xuất hiện.
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

  // flat = thứ tự duyệt trong lightbox (hero trước, rồi từng tháng). Hero chỉ hiện ở "Tất cả".
  const { flat, groups, hero } = useMemo(() => {
    const filtered = tag ? items.filter((item) => item.tag.toLowerCase() === tag) : items;
    const heroIndex = tag ? -1 : Math.max(0, filtered.findIndex((item) => item.featured));
    const heroItem = heroIndex >= 0 ? filtered[heroIndex] : undefined;
    const byMonth = new Map<string, CampusItem[]>();
    filtered.forEach((item, i) => {
      if (i === heroIndex) return;
      const key = monthKey(item.date);
      byMonth.set(key, [...(byMonth.get(key) ?? []), item]);
    });
    const flatList: CampusItem[] = heroItem ? [heroItem] : [];
    const grouped: { key: string; label: string; entries: Entry[] }[] = [];
    // Tháng mới nhất trước; ảnh chưa ghi ngày (key rỗng) luôn xuống cuối.
    const orderedMonths = [...byMonth].sort(([a], [b]) => (a === "" ? 1 : b === "" ? -1 : b.localeCompare(a)));
    for (const [key, list] of orderedMonths) {
      grouped.push({ key, label: monthLabel(key), entries: list.map((item) => ({ item, idx: flatList.push(item) - 1 })) });
    }
    return { flat: flatList, groups: grouped, hero: heroItem };
  }, [items, tag]);

  // Số liệu gọn dưới ảnh bìa: chỉ nêu điều có thật, không ghép thành câu.
  const stats = useMemo(() => {
    const places = new Set(items.map((i) => i.place.trim().toLowerCase()).filter(Boolean));
    const months = [...new Set(items.map((i) => monthKey(i.date)).filter(Boolean))].sort();
    const short = (key: string) => `${Number(key.slice(5))}/${key.slice(0, 4)}`;
    const span =
      months.length === 0
        ? ""
        : months.length === 1
          ? `Tháng ${short(months[0])}`
          : `Tháng ${short(months[0])} – ${short(months[months.length - 1])}`;
    return { places: places.size, span };
  }, [items]);

  const current = open === null ? null : flat[open];
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
    (delta: number) => setOpen((cur) => (cur === null ? cur : (cur + delta + flat.length) % flat.length)),
    [flat.length]
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

  // Ảnh hiện dần khi cuộn tới (1 observer cho cả trang).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.05 }
    );
    document.querySelectorAll(".cp-tile:not(.is-in)").forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [groups]);

  if (items.length === 0) {
    return (
      <section className="section no-top">
        <div className="container">
          <div className="empty-state">
            Chưa có ảnh. Kiểm tra biến môi trường <code>CAMPUS_SHEET_CSV_URL</code> trong <code>.env.local</code> và tab Campus
            (cột <code>title</code> bắt buộc).
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section no-top campus-journal">
      <div className="container">
        {hero ? (
          <button type="button" className="cp-hero" onClick={(e) => openAt(0, e.currentTarget)}>
            <SafeImage src={hero.image} alt="" fallback={null} loading="eager" />
            <span className="cp-hero-text">
              {metaLine(hero) ? <span className="cp-hero-meta">{metaLine(hero)}</span> : null}
              <span className="cp-hero-title">{hero.title}</span>
              {hero.summary ? <span className="cp-hero-sum">{hero.summary}</span> : null}
            </span>
          </button>
        ) : null}

        <ul className="cp-stats" aria-label="Tổng quan">
          <li><b>{items.length}</b> ảnh</li>
          {stats.places > 0 ? <li><b>{stats.places}</b> địa điểm</li> : null}
          {stats.span ? <li>{stats.span}</li> : null}
        </ul>

        {tags.length > 1 ? (
          <div className="cp-filter">
            <div className="type-chips" role="tablist" aria-label="Lọc ảnh theo nhãn">
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

        {groups.map((group) => (
          <div className="cp-month" key={group.key || "other"}>
            {group.key || groups.length > 1 ? (
              <div className="cp-month-head">
                <h2>{group.label}</h2>
                {group.entries.length > 1 ? <span>{group.entries.length} ảnh</span> : null}
              </div>
            ) : null}
            <div className="cp-masonry">
              {group.entries.map(({ item, idx }) => (
                <button
                  type="button"
                  key={`${item.title}-${idx}`}
                  className="cp-tile"
                  onClick={(e) => openAt(idx, e.currentTarget)}
                  aria-label={`Xem ảnh: ${item.title}`}
                >
                  <SafeImage src={item.image} alt={item.title} loading="lazy" fallback={<span className="campus-empty">Chưa có ảnh</span>} />
                  <span className="cp-cap">
                    <b>{item.title}</b>
                    {item.date ? <small>{formatDate(item.date)}</small> : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {current ? (
        <div className="campus-lb" role="dialog" aria-modal="true" aria-label={current.title} onClick={close}>
          <div className="campus-lb-card" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="campus-lb-close" onClick={close} aria-label="Đóng">×</button>
            <div
              className="campus-lb-stage"
              onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
              }}
            >
              <SafeImage src={current.image} alt={current.title} fallback={<span className="campus-empty">Chưa có ảnh</span>} />
              {flat.length > 1 ? (
                <>
                  <button type="button" className="campus-lb-nav is-prev" onClick={() => step(-1)} aria-label="Ảnh trước">‹</button>
                  <button type="button" className="campus-lb-nav is-next" onClick={() => step(1)} aria-label="Ảnh sau">›</button>
                </>
              ) : null}
            </div>
            <div className="campus-lb-note">
              <div className="campus-meta">
                {metaLine(current) ? <span>{metaLine(current)}</span> : null}
                {current.tag ? <span className="type">{current.tag}</span> : null}
              </div>
              <h3>{current.title}</h3>
              {current.summary ? <p>{current.summary}</p> : <p className="muted-note">Chưa có note cho ảnh này.</p>}
              {current.url ? <a className="campus-link" href={current.url} target="_blank" rel="noreferrer">Xem thêm</a> : null}
              <span className="campus-lb-count">{(open ?? 0) + 1} / {flat.length}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
