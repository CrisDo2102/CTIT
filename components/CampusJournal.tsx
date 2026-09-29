"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { CampusItem } from "@/lib/dashboard-types";

type Props = { items: CampusItem[] };

// 2026-09-20 -> 20/09/2026. Dinh dang khac (sheet tu doi ngay) thi giu nguyen.
function formatDate(value: string): string {
  const m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? `${m[3].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[1]}` : value;
}

const metaLine = (item: CampusItem) => [formatDate(item.date), item.place].filter(Boolean).join(" · ");

export function CampusJournal({ items }: Props) {
  const [tag, setTag] = useState(""); // "" = Tất cả, còn lại là tag viết thường
  const [open, setOpen] = useState<number | null>(null); // index trong `shown`
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Gom tag không phân biệt hoa/thường ("Lab" và "lab" chung 1 chip), giữ thứ tự xuất hiện.
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

  // Hero chỉ hiện ở "Tất cả": dòng featured đầu tiên, không có thì dòng đầu.
  const heroIndex = tag ? -1 : Math.max(0, items.findIndex((item) => item.featured));
  const hero = heroIndex >= 0 ? shown[heroIndex] : undefined;
  const grid = shown.map((item, index) => ({ item, index })).filter((entry) => entry.index !== heroIndex);

  const current = open === null ? null : shown[open];
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
    (delta: number) => setOpen((cur) => (cur === null ? cur : (cur + delta + shown.length) % shown.length)),
    [shown.length]
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
          <button type="button" className="campus-hero" onClick={(e) => openAt(heroIndex, e.currentTarget)}>
            <SafeImage src={hero.image} alt="" fallback={null} loading="eager" />
            <span className="campus-hero-shade" />
            <span className="campus-hero-text">
              <span className="campus-badge">Nổi bật</span>
              {metaLine(hero) ? <span className="campus-hero-meta">{metaLine(hero)}</span> : null}
              <span className="campus-hero-title">{hero.title}</span>
              {hero.summary ? <span className="campus-hero-summary">{hero.summary}</span> : null}
            </span>
          </button>
        ) : null}

        {tags.length > 1 ? (
          <div className="campus-filter">
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

        {grid.length > 0 ? (
          <div className="campus-grid">
            {grid.map(({ item, index }, position) => {
              const big = position % 6 === 3; // mỗi 6 ảnh có 1 ảnh to 2x2, đổi bên trái/phải theo vòng
              const right = big && Math.floor(position / 6) % 2 === 1;
              return (
                <button
                  type="button"
                  key={`${item.title}-${index}`}
                  className={`campus-tile${big ? " is-big" : ""}${right ? " is-right" : ""}`}
                  onClick={(e) => openAt(index, e.currentTarget)}
                  aria-label={`Xem ảnh: ${item.title}`}
                >
                  <SafeImage src={item.image} alt={item.title} loading="lazy" fallback={<span className="campus-empty">Chưa có ảnh</span>} />
                  <span className="campus-tile-cap">
                    <span className="campus-tile-title">{item.title}</span>
                    {item.date ? <span className="campus-tile-date">{formatDate(item.date)}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {current ? (
        <div className="campus-lb" role="dialog" aria-modal="true" aria-label={current.title} onClick={close}>
          <div className="campus-lb-card" onClick={(e) => e.stopPropagation()}>
            <button ref={closeRef} type="button" className="campus-lb-close" onClick={close} aria-label="Đóng">×</button>
            <div className="campus-lb-stage">
              <SafeImage src={current.image} alt={current.title} fallback={<span className="campus-empty">Chưa có ảnh</span>} />
              {shown.length > 1 ? (
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
              {current.url ? <a className="campus-link" href={current.url} target="_blank" rel="noreferrer">Xem thêm ↗</a> : null}
              <span className="campus-lb-count">{(open ?? 0) + 1} / {shown.length}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
