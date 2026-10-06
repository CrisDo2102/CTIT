"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type PointerEvent } from "react";
import type { ResearchData, ResearchItem } from "@/lib/dashboard-types";
import { PeekImage } from "@/components/PeekImage";
import "./research.css";
import { Reveal, useCountUp } from "@/components/motion";

type FilterKey = "all" | keyof ResearchData;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "focus", label: "Hướng nghiên cứu" },
  { key: "project", label: "Dự án" },
  { key: "achievement", label: "Thành tích" },
  { key: "publication", label: "Ấn phẩm" }
];

const STATS: { key: keyof ResearchData; label: string }[] = [
  { key: "project", label: "dự án đang triển khai" },
  { key: "publication", label: "bài báo / ấn phẩm" },
  { key: "achievement", label: "thành tích & giải thưởng" },
  { key: "focus", label: "hướng nghiên cứu" }
];

// Nút "nam châm": nút nhích theo con trỏ (kiểu các site Awwwards / Godly)
const magnet = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left - r.width / 2) * 0.25;
  const y = (e.clientY - r.top - r.height / 2) * 0.35;
  e.currentTarget.style.transform = `translate(${x}px, ${y}px)`;
};
const unmagnet = (e: PointerEvent<HTMLElement>) => { e.currentTarget.style.transform = ""; };

/* ---------- Hero kiểu Spline: cảnh 3D theo con trỏ. Đặt NEXT_PUBLIC_SPLINE_URL để thay bằng scene Spline thật ---------- */

export function ResearchHero() {
  const ref = useRef<HTMLElement>(null);
  const spline = process.env.NEXT_PUBLIC_SPLINE_URL;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--rx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    e.currentTarget.style.setProperty("--ry", String(((e.clientY - r.top) / r.height - 0.5) * 2));
    e.currentTarget.style.setProperty("--px", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--py", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <section className="rx-hero" ref={ref} onPointerMove={onMove}>
      <div className="rx-hero-inner">
        <div>
          <span className="rx-kicker"><i />CTIT Research</span>
          <h1>
            <span className="rx-word" style={{ "--w": 0 } as CSSProperties}>Nghiên</span>{" "}
            <span className="rx-word" style={{ "--w": 1 } as CSSProperties}>cứu</span>
          </h1>
          <p>
            Từ ý tưởng đến nguyên mẫu và sản phẩm: CTIT phát triển các hướng Embedded Systems,
            Automotive Electronics.
          </p>
          <div className="rx-cta">
            <a className="rx-btn primary" href="#rx-projects" onPointerMove={magnet} onPointerLeave={unmagnet}>Xem dự án</a>
            <a className="rx-btn ghost" href="#rx-publications" onPointerMove={magnet} onPointerLeave={unmagnet}>Ấn phẩm</a>
          </div>
        </div>
        <div className="rx-stage" aria-hidden="true">
          {spline ? (
            <iframe src={spline} title="CTIT 3D" loading="lazy" />
          ) : (
            <>
              <div className="rx-chip">
                <div className="rx-layer" /><div className="rx-layer" /><div className="rx-layer">CTIT</div>
              </div>
              {[["Embedded Systems", 30], ["Automotive Electronics", -36]].map(([t, d]) => (
                <span className="rx-tag" key={t} style={{ "--d": d } as CSSProperties}>{t}</span>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Tiện ích chuyển động ---------- */
// Con trỏ phát sáng trong thẻ (kiểu Spline/Manus)
const glow = (e: PointerEvent<HTMLElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

// "Sequencer" kiểu Theatre.js: tiến độ cuộn 0→1 điều khiển --p
function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = node.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
      node.style.setProperty("--p", p.toFixed(3));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => { removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
  return ref;
}
function StatCell({ value, label, active }: { value: number; label: string; active: boolean }) {
  const shown = useCountUp(value, active);
  return <div className="rx-stat"><strong>{shown}</strong><span>{label}</span></div>;
}

function StatStrip({ data }: { data: ResearchData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div className="rx-stats" ref={ref}>
      {STATS.map((s) => <StatCell key={s.key} value={data[s.key].length} label={s.label} active={active} />)}
    </div>
  );
}

/* ---------- Dải chữ chạy (marquee) + tiêu đề dạng editorial ---------- */

const MARQUEE = ["Embedded Systems", "Automotive Electronics", "Ý tưởng", "Nguyên mẫu", "Sản phẩm"];

function Marquee() {
  return (
    <div className="rx-marquee" aria-hidden="true">
      <div className="rx-marquee-track">
        {[0, 1].map((k) => (
          <div className="rx-marquee-set" key={k}>
            {MARQUEE.map((t) => <span key={t}>{t}<i /></span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecTitle({ n, children }: { n: string; children: ReactNode }) {
  return (
    <Reveal>
      <div className="rx-sectitle"><span>{n}</span><h2>{children}</h2></div>
    </Reveal>
  );
}

/* ---------- Hướng nghiên cứu ---------- */

const initialsOf = (t: string) => {
  const w = t.trim().split(/\s+/).filter(Boolean);
  return w.length === 0 ? "?" : w.length === 1 ? w[0].slice(0, 2).toUpperCase() : (w[0][0] + w[1][0]).toUpperCase();
};
const norm = (v: string) => v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

function FocusShowcase({ items, projects }: { items: ResearchItem[]; projects: ResearchItem[] }) {
  const [active, setActive] = useState(0);
  const current = items[Math.min(active, items.length - 1)];
  const related = projects.filter((p) => p.category && norm(p.category) === norm(current.title)).slice(0, 2);

  return (
    <div>
      {items.length > 1 ? (
        <div className="rx-focus-tabs" role="tablist" aria-label="Chọn hướng nghiên cứu">
          {items.map((it, i) => (
            <button key={`${it.index}-${it.title}`} type="button" role="tab" aria-selected={i === active}
              className={`rx-chipbtn${i === active ? " is-active" : ""}`} onClick={() => setActive(i)}>
              {it.title}
            </button>
          ))}
        </div>
      ) : null}
      <div className="rx-glass rx-focus-panel" onPointerMove={glow} key={current.title}>
        <div className="rx-focus-media">
          {current.image ? <PeekImage src={current.image} alt={current.title} wrapperClass="rx-media" bgClass="rx-media-bg" imgClass="rx-media-img" /> : <span className="rx-mono" aria-hidden="true">{initialsOf(current.title)}</span>}
        </div>
        <div className="rx-focus-body">
          <h3>{current.title}</h3>
          {current.tag ? <span className="rx-caption">{current.tag}</span> : null}
          {current.content ? <p>{current.content}</p> : null}
          {related.map((p) => {
            const body = <><strong>{p.title}</strong>{p.content ? <span>{p.content}</span> : null}</>;
            return p.url
              ? <a key={`${p.index}-${p.title}`} className="rx-mini" href={p.url} target="_blank" rel="noreferrer">{body}</a>
              : <div key={`${p.index}-${p.title}`} className="rx-mini">{body}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Dự án (bento) ---------- */

function ProjectCard({ item, spot }: { item: ResearchItem; spot: boolean }) {
  return (
    <article className={`rx-glass rx-project${spot ? " is-spot" : ""}`} onPointerMove={glow}>
      {item.image ? <PeekImage src={item.image} alt={item.title} wrapperClass="rx-media" bgClass="rx-media-bg" imgClass="rx-media-img" /> : null}
      <div className="rx-project-body">
        {item.date ? <span className="rx-date">{item.date}</span> : null}
        <h3>{item.title}</h3>
        {item.tag ? <span className="rx-caption">{item.tag}</span> : null}
        {item.content ? <p>{item.content}</p> : null}
        {item.url ? <a className="rx-link" href={item.url} target="_blank" rel="noreferrer">Xem chi tiết →</a> : null}
      </div>
    </article>
  );
}

/* ---------- Thành tích (timeline cuộn) ---------- */

function Achievements({ items }: { items: ResearchItem[] }) {
  const ref = useScrollProgress<HTMLOListElement>();
  return (
    <ol className="rx-timeline" ref={ref}>
      {items.map((it, i) => (
        <li key={`${it.index}-${it.title}`}>
          <span className="rx-dot">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5 7 21l5-2.5L17 21l-1.5-8.5" /></svg>
          </span>
          <Reveal i={i % 3}>
            {it.date ? <span className="rx-date">{it.date}</span> : null}
            {it.title ? <h4>{it.title}</h4> : null}
            {it.tag ? <span className="rx-caption">{it.tag}</span> : null}
            {it.content ? <p>{it.content}</p> : null}
            {it.url ? <a className="rx-link" href={it.url} target="_blank" rel="noreferrer">Xem kết quả / tin liên quan →</a> : null}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Ấn phẩm ---------- */

const yearOf = (d: string) => d.match(/\d{4}/)?.[0] ?? "Khác";

function groupByYear(items: ResearchItem[]) {
  const g = new Map<string, ResearchItem[]>();
  items.forEach((it) => {
    const k = it.date ? yearOf(it.date) : "Khác";
    g.set(k, [...(g.get(k) ?? []), it]);
  });
  return Array.from(g.entries()).sort(([a], [b]) => (a === "Khác" ? 1 : b === "Khác" ? -1 : b.localeCompare(a)));
}

export function ResearchExplorer({ data }: { data: ResearchData }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const show = (k: keyof ResearchData) => (filter === "all" || filter === k ? data[k] : []);
  const focus = show("focus"), project = show("project"), achievement = show("achievement"), publication = show("publication");
  const count = focus.length + project.length + achievement.length + publication.length;
  const total = STATS.reduce((n, s) => n + data[s.key].length, 0);
  const [spot, ...rest] = project;

  return (
    <>
      <Marquee />
      <StatStrip data={data} />

      <div className="rx-tabs-wrap">
        <div className="rx-tabs" role="tablist" aria-label="Lọc nội dung nghiên cứu">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key}
              className={`rx-tab${filter === f.key ? " is-active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}<em>{f.key === "all" ? total : data[f.key].length}</em>
            </button>
          ))}
        </div>
      </div>

      {focus.length > 0 ? (
        <section className="rx-sec">
          <SecTitle n="01">Hướng nghiên cứu</SecTitle>
          <Reveal i={1}><FocusShowcase items={focus} projects={data.project} /></Reveal>
        </section>
      ) : null}

      {spot ? (
        <section className="rx-sec" id="rx-projects">
          <SecTitle n="02">Dự án nghiên cứu</SecTitle>
          <div className="rx-bento">
            <Reveal i={0} className={rest.length > 0 ? "rx-project-wrap is-spot-wrap" : ""}>
              <ProjectCard item={spot} spot={rest.length > 0} />
            </Reveal>
            {rest.map((it, i) => (
              <Reveal i={i + 1} key={`${it.index}-${it.title}`}><ProjectCard item={it} spot={false} /></Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {achievement.length > 0 ? (
        <section className="rx-sec rx-dark">
          <SecTitle n="03">Thành tích & giải thưởng</SecTitle>
          <Achievements items={achievement} />
        </section>
      ) : null}

      {publication.length > 0 ? (
        <section className="rx-sec" id="rx-publications">
          <SecTitle n="04">Bài báo / ấn phẩm</SecTitle>
          {groupByYear(publication).map(([year, items]) => (
            <div className="rx-pubgroup" key={year}>
              <span className="rx-year">{year}</span>
              <div>
                {items.map((it, i) => (
                  <Reveal i={i % 3} key={`${it.index}-${it.title}`}>
                    <article className="rx-glass rx-pub" onPointerMove={glow}>
                      <div>
                        <h3>{it.title}</h3>
                        {it.tag ? <span className="rx-caption">{it.tag}</span> : null}
                        {it.date ? <span className="rx-date">{it.date}</span> : null}
                        {it.content ? <p>{it.content}</p> : null}
                      </div>
                      {it.url ? <a className="rx-link" href={it.url} target="_blank" rel="noreferrer">Mở bài viết ↗</a> : null}
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {count === 0 ? <div className="rx-sec rx-empty">Không có nội dung phù hợp với bộ lọc này.</div> : null}
      <div style={{ height: 80 }} />
    </>
  );
}
