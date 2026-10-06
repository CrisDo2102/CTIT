"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { NewsItem } from "@/lib/sheet-data";
import { contact, socials } from "@/lib/site-config";
import "./news.css";
import { PeekImage } from "@/components/PeekImage";
import { Reveal } from "@/components/motion";
import { ArrowIcon } from "@/components/icons";
import { padIndex } from "@/lib/format";

/* ---------- tiện ích ---------- */
function NewsLink({ item, children, className = "" }: { item: NewsItem; children: ReactNode; className?: string }) {
  if (!item.url) return <article className={className}>{children}</article>;
  const external = /^https?:\/\//i.test(item.url);
  return (
    <Link href={item.url} className={className} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
    </Link>
  );
}

// Ảnh hiển thị đủ (object-fit: contain), phần thừa được lấp bằng chính ảnh đó làm nền mờ.
// Bấm vào ảnh thì phóng to khoảng 3/4 màn hình (xem components/PeekImage.tsx).
function Cover({ item, className = "", scope = "image" }: { item: NewsItem; className?: string; scope?: "image" | "card" }) {
  return item.image ? (
    <PeekImage
      src={item.image}
      wrapperClass={`nw-media ${className}`}
      bgClass="nw-media-bg"
      imgClass="nw-media-img"
      alt={item.title}
      scope={scope}
    />
  ) : (
    <div className={`nw-cover nw-cover-empty ${className}`} aria-hidden="true">CTIT</div>
  );
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
      <Cover item={item} scope="card" />
      <div className="nw-feature-shade" />
      <div className="nw-feature-copy">
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
        <span className="nw-more" data-peek-skip>Đọc tiếp <ArrowIcon /></span>
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
        <span className="nw-go"><ArrowIcon /></span>
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
      <span className="nw-row-n">{padIndex(i)}</span>
      <div className="nw-row-main">
        <Meta item={item} />
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
      </div>
      <span className="nw-go"><ArrowIcon /></span>
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
  const num = (id: string) => padIndex(sections.findIndex((s) => s.id === id));

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
                    <span>{padIndex(i)}</span><strong>{s.label}</strong><em>{s.count}</em>
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
              {hasFacebook ? <a className="nw-btn light" href={facebook} target="_blank" rel="noreferrer">Theo dõi Facebook <ArrowIcon /></a> : null}
              <a className="nw-btn outline" href={`mailto:${contact.email}`}>Gửi email</a>
              <Link className="nw-btn outline" href="/resources">Khám phá tài nguyên</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
