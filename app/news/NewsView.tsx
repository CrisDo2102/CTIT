"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { NewsItem } from "@/lib/sheet-data";
import { contact, socials } from "@/lib/site-config";
import "./news.css";

/* ---------- tiện ích ---------- */

function Reveal({ children, i = 0, className = "" }: { children: ReactNode; i?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { node.classList.add("is-in"); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`nw-reveal ${className}`} style={{ "--i": i } as CSSProperties}>{children}</div>;
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" /><path d="M9 7h8v8" />
    </svg>
  );
}

function NewsLink({ item, children, className = "" }: { item: NewsItem; children: ReactNode; className?: string }) {
  if (!item.url) return <article className={className}>{children}</article>;
  const external = /^https?:\/\//i.test(item.url);
  return (
    <Link href={item.url} className={className} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
    </Link>
  );
}

function Cover({ item, className = "" }: { item: NewsItem; className?: string }) {
  return item.image
    ? <img className={`nw-cover ${className}`} src={item.image} alt="" loading="lazy" />
    : <div className={`nw-cover nw-cover-empty ${className}`} aria-hidden="true">CTIT</div>;
}

function Meta({ item }: { item: NewsItem }) {
  return (
    <div className="nw-meta">
      <span className="nw-pill">{item.category || "Tin tức"}</span>
      {item.date ? <time>{item.date}</time> : null}
    </div>
  );
}

function SectionHead({ n, title, note, light = false }: { n: string; title: string; note?: string; light?: boolean }) {
  return (
    <Reveal>
      <div className={`nw-head${light ? " is-light" : ""}`}>
        <div><span className="nw-head-n">{n}</span><h2>{title}</h2></div>
        {note ? <span className="nw-head-note">{note}</span> : null}
      </div>
    </Reveal>
  );
}

/* ---------- các loại thẻ ---------- */

function FeatureCard({ item }: { item: NewsItem }) {
  return (
    <NewsLink item={item} className="nw-feature">
      <Cover item={item} />
      <div className="nw-feature-shade" />
      <div className="nw-feature-copy">
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
        <span className="nw-more">Đọc tiếp <Arrow /></span>
      </div>
    </NewsLink>
  );
}

function SideCard({ item }: { item: NewsItem }) {
  return (
    <NewsLink item={item} className="nw-side">
      <Cover item={item} />
      <div>
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
    </NewsLink>
  );
}

function Card({ item, dark = false }: { item: NewsItem; dark?: boolean }) {
  return (
    <NewsLink item={item} className={`nw-card${dark ? " is-dark" : ""}`}>
      <div className="nw-card-media">
        <Cover item={item} />
        <span className="nw-go"><Arrow /></span>
      </div>
      <div className="nw-card-body">
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
    </NewsLink>
  );
}

function MediaRow({ item, i }: { item: NewsItem; i: number }) {
  return (
    <NewsLink item={item} className="nw-row">
      <span className="nw-row-n">{pad(i)}</span>
      <div className="nw-row-main">
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
      <span className="nw-go"><Arrow /></span>
    </NewsLink>
  );
}

/* ---------- trang ---------- */

export function NewsView({ items }: { items: NewsItem[] }) {
  const headlines = items.filter((x) => x.section === "headlines");
  const latest = items.filter((x) => x.section === "latest");
  const media = items.filter((x) => x.section === "media");
  const features = items.filter((x) => x.section === "features");
  const [hero, ...restHeadlines] = headlines;
  const side = restHeadlines.slice(0, 2);

  const sections = [
    { id: "nw-headlines", label: "Tiêu điểm", count: headlines.length },
    { id: "nw-latest", label: "Tin mới nhất", count: latest.length },
    { id: "nw-media", label: "Báo chí", count: media.length },
    { id: "nw-features", label: "Chuyên đề", count: features.length }
  ].filter((s) => s.count > 0);
  const num = (id: string) => pad(sections.findIndex((s) => s.id === id));

  // bộ lọc danh mục cho "Tin mới nhất"
  const [cat, setCat] = useState("all");
  const cats = Array.from(new Set(latest.map((x) => x.category).filter(Boolean)));
  const shownLatest = cat === "all" ? latest : latest.filter((x) => x.category === cat);

  // scroll-spy
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join()]);

  const facebook = socials.find((s) => s.name === "Facebook")?.href;
  const hasFacebook = facebook && facebook !== "#";
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" });

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="nw-hero">
        <div className="nw-wrap nw-hero-grid">
          <div>
            <span className="nw-eyebrow"><i />CTIT · Tin tức</span>
            <h1><span className="nw-line"><span>Tin tức</span></span></h1>
            <p className="nw-lead">Nghiên cứu, công nghệ, sự kiện và những câu chuyện từ Closed Thinking Institute of Technology.</p>
          </div>
          {sections.length > 0 ? (
            <ol className="nw-index" aria-label="Mục lục">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span>{pad(i)}</span><strong>{s.label}</strong><em>{s.count}</em>
                  </a>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
        <div className="nw-wrap nw-dateline">
          <span suppressHydrationWarning>{today}</span>
          <span>{items.length} bài viết</span>
        </div>
      </section>

      {sections.length > 1 ? (
        <div className="nw-nav-wrap">
          <nav className="nw-nav" aria-label="Các mục tin tức">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? "is-active" : ""}>{s.label}</a>
            ))}
          </nav>
        </div>
      ) : null}

      {/* ===== 01 tiêu điểm ===== */}
      {hero ? (
        <section className="nw-sec" id="nw-headlines">
          <div className="nw-wrap">
            <SectionHead n={num("nw-headlines")} title="Tiêu điểm" note="Bài viết nổi bật" />
            <div className="nw-headlines">
              <Reveal><FeatureCard item={hero} /></Reveal>
              {side.length ? (
                <div className="nw-side-stack">
                  {side.map((x, i) => <Reveal i={i + 1} key={`${x.title}-${x.order}`}><SideCard item={x} /></Reveal>)}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== 02 tin mới nhất ===== */}
      {latest.length ? (
        <section className="nw-sec nw-soft" id="nw-latest">
          <div className="nw-wrap">
            <SectionHead n={num("nw-latest")} title="Tin mới nhất" note={`${latest.length} bài viết`} />
            {cats.length > 1 ? (
              <div className="nw-chips" role="tablist" aria-label="Lọc theo danh mục">
                {["all", ...cats].map((c) => (
                  <button key={c} type="button" role="tab" aria-selected={cat === c}
                    className={`nw-chip${cat === c ? " is-active" : ""}`} onClick={() => setCat(c)}>
                    {c === "all" ? "Tất cả" : c}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="nw-grid">
              {shownLatest.map((x, i) => <Reveal i={i % 3} key={`${x.title}-${x.order}`}><Card item={x} /></Reveal>)}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== 03 báo chí ===== */}
      {media.length ? (
        <section className="nw-sec" id="nw-media">
          <div className="nw-wrap">
            <SectionHead n={num("nw-media")} title="Báo chí nói về CTIT" note="Truyền thông đưa tin" />
            <div className="nw-rows">
              {media.map((x, i) => <Reveal i={i % 3} key={`${x.title}-${x.order}`}><MediaRow item={x} i={i} /></Reveal>)}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== 04 chuyên đề: dải tối ===== */}
      {features.length ? (
        <section className="nw-sec nw-dark" id="nw-features">
          <div className="nw-wrap">
            <SectionHead n={num("nw-features")} title="Chuyên đề & góc nhìn" note="Câu chuyện từ CTIT" light />
            <div className="nw-grid">
              {features.map((x, i) => <Reveal i={i % 3} key={`${x.title}-${x.order}`}><Card item={x} dark /></Reveal>)}
            </div>
          </div>
        </section>
      ) : null}

      {!items.length ? (
        <section className="nw-sec">
          <div className="nw-wrap nw-empty">
            Chưa có bài viết nào. Kiểm tra tab News trong Google Sheet và biến <code>NEWS_SHEET_CSV_URL</code> trong <code>.env.local</code>.
          </div>
        </section>
      ) : null}

      {/* ===== kết nối ===== */}
      <section className="nw-wrap nw-final-wrap">
        <Reveal>
          <div className="nw-final">
            <span className="nw-final-kicker">Kết nối cùng CTIT</span>
            <h2>Theo dõi những gì đang diễn ra tại CTIT.</h2>
            <div className="nw-cta">
              {hasFacebook ? <a className="nw-btn light" href={facebook} target="_blank" rel="noreferrer">Theo dõi Facebook <Arrow /></a> : null}
              <a className="nw-btn outline" href={`mailto:${contact.email}`}>Gửi email</a>
              <Link className="nw-btn outline" href="/resources">Khám phá tài nguyên</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
