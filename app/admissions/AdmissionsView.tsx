"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { AdmissionsData, AdmissionsTrack } from "@/lib/dashboard-types";
import { contact, socials } from "@/lib/site-config";
import "./admissions.css";

/* ---------- tiện ích ---------- */

function Reveal({ children, i = 0, className = "" }: { children: ReactNode; i?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { node.classList.add("is-in"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`adm-reveal ${className}`} style={{ "--i": i } as CSSProperties}>{children}</div>;
}

const pad = (n: number) => String(n + 1).padStart(2, "0");

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" /><path d="M9 7h8v8" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.5 4.5 4.5L19 7.500" />
    </svg>
  );
}

function SectionHead({ n, title, sub, light = false }: { n: string; title: string; sub?: string; light?: boolean }) {
  return (
    <Reveal>
      <div className={`adm-head${light ? " is-light" : ""}`}>
        <span className="adm-head-n">{n}</span>
        <h2>{title}</h2>
        {sub ? <p>{sub}</p> : null}
      </div>
    </Reveal>
  );
}

/* ---------- thẻ hướng hoạt động ---------- */

function TrackCard({ track, i }: { track: AdmissionsTrack; i: number }) {
  const inner = (
    <>
      <div className="adm-track-media">
        {track.image ? <img src={track.image} alt="" loading="lazy" /> : <span className="adm-track-mono" aria-hidden="true">{track.title.slice(0, 2).toUpperCase()}</span>}
        <span className="adm-track-n">{pad(i)}</span>
      </div>
      <div className="adm-track-body">
        <h3>{track.title}</h3>
        {track.content ? <p>{track.content}</p> : null}
        {track.url ? <span className="adm-go"><Arrow /></span> : null}
      </div>
    </>
  );
  return track.url
    ? <a className="adm-track" href={track.url} target="_blank" rel="noreferrer">{inner}</a>
    : <article className="adm-track">{inner}</article>;
}

/* ---------- trang ---------- */

export function AdmissionsView({ data }: { data: AdmissionsData }) {
  const { status, steps, requirements, tracks, timeline, faqs } = data;
  const isEmpty = !status && !steps.length && !requirements.length && !tracks.length && !timeline.length && !faqs.length;

  const sections = [
    { id: "adm-tracks", label: "Hướng hoạt động", on: tracks.length > 0 },
    { id: "adm-steps", label: "Quy trình", on: steps.length > 0 },
    { id: "adm-req", label: "Điều kiện", on: requirements.length > 0 },
    { id: "adm-timeline", label: "Mốc thời gian", on: timeline.length > 0 },
    { id: "adm-faq", label: "Hỏi đáp", on: faqs.length > 0 }
  ].filter((s) => s.on);
  const num = (id: string) => pad(sections.findIndex((s) => s.id === id));

  // scroll-spy cho thanh điều hướng
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
  const firstAnchor = sections[0] ? `#${sections[0].id}` : undefined;

  const facts = [
    { v: tracks.length, l: "hướng hoạt động" },
    { v: steps.length, l: "bước tham gia" },
    { v: requirements.length, l: "điều kiện" },
    { v: timeline.length, l: "mốc thời gian" }
  ].filter((f) => f.v > 0);

  return (
    <>
      {/* ===== HERO: duy nhất 1 tiêu đề cho cả trang ===== */}
      <section className="adm-hero">
        <div className="adm-wrap adm-hero-grid">
          <div>
            <span className="adm-eyebrow"><i />CTIT · Admissions</span>
            <h1>
              <span className="adm-line"><span>Tuyển</span></span>{" "}
              <span className="adm-line"><span>sinh</span></span>
            </h1>
            <p className="adm-lead">
              Khám phá các hướng hoạt động, quy trình tham gia và cơ hội phát triển năng lực cùng CTIT.
            </p>
            <div className="adm-cta">
              {status?.url ? (
                <a className="adm-btn primary" href={status.url} target="_blank" rel="noreferrer">Đăng ký ngay <Arrow /></a>
              ) : (
                <a className="adm-btn primary" href={`mailto:${contact.email}`}>Liên hệ CTIT <Arrow /></a>
              )}
              {firstAnchor ? <a className="adm-btn ghost" href={firstAnchor}>Tìm hiểu thêm</a> : null}
            </div>
          </div>

          <div className="adm-ticket" aria-label="Trạng thái tuyển sinh">
            <div className="adm-ticket-top">
              <span className="adm-live"><i />{status ? "Application status" : "CTIT"}</span>
              <span className="adm-ticket-code">{new Date().getFullYear()}</span>
            </div>
            <strong>{status ? status.title || "Đang tuyển" : "Cùng xây dựng, cùng chế tạo"}</strong>
            <p>{status?.content || "Đăng ký để trở thành một phần của cộng đồng CTIT."}</p>
            <div className="adm-ticket-cut" aria-hidden="true" />
            <div className="adm-ticket-foot">
              <span>Closed Thinking Institute of Technology</span>
              <b>→</b>
            </div>
          </div>
        </div>

        {facts.length > 0 ? (
          <div className="adm-wrap adm-facts">
            {facts.map((f) => (
              <div key={f.l}><strong>{f.v}</strong><span>{f.l}</span></div>
            ))}
          </div>
        ) : null}
      </section>

      {/* ===== thanh điều hướng nội trang (dính khi cuộn) ===== */}
      {sections.length > 1 ? (
        <div className="adm-nav-wrap">
          <nav className="adm-nav" aria-label="Các phần trong trang tuyển sinh">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? "is-active" : ""}>{s.label}</a>
            ))}
          </nav>
        </div>
      ) : null}

      {/* ===== 01 hướng hoạt động ===== */}
      {tracks.length > 0 ? (
        <section className="adm-sec" id="adm-tracks">
          <div className="adm-wrap">
            <SectionHead n={num("adm-tracks")} title="Các hướng hoạt động" sub="Chọn hướng phù hợp với sở thích và mục tiêu kỹ thuật của bạn." />
            <div className="adm-tracks">
              {tracks.map((t, i) => (
                <Reveal i={i % 3} key={`${t.title}-${i}`}><TrackCard track={t} i={i} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== 02 quy trình: hành trình cuộn ngang ===== */}
      {steps.length > 0 ? (
        <section className="adm-sec adm-soft" id="adm-steps">
          <div className="adm-wrap">
            <SectionHead n={num("adm-steps")} title="Quy trình tham gia" sub="Từ bước tìm hiểu đến khi trở thành thành viên CTIT." />
          </div>
          <div className="adm-wrap adm-rail-wrap">
            <ol className="adm-rail">
              {steps.map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  <Reveal i={i % 4}>
                    <div className="adm-step">
                      <span className="adm-step-n">{pad(i)}</span>
                      <h3>{s.title}</h3>
                      {s.content ? <p>{s.content}</p> : null}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ===== 03 điều kiện: cột trái dính + checklist ===== */}
      {requirements.length > 0 ? (
        <section className="adm-sec" id="adm-req">
          <div className="adm-wrap adm-split">
            <div className="adm-split-side">
              <SectionHead n={num("adm-req")} title="Ai có thể tham gia?" sub="Những điều kiện và đối tượng CTIT đang tìm kiếm." />
            </div>
            <ul className="adm-checks">
              {requirements.map((r, i) => (
                <li key={`${r.title}-${i}`}>
                  <Reveal i={i % 4}>
                    <div className="adm-check"><span><Check /></span><strong>{r.title}</strong></div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ===== 04 mốc thời gian: dải tối ===== */}
      {timeline.length > 0 ? (
        <section className="adm-sec adm-dark" id="adm-timeline">
          <div className="adm-wrap">
            <SectionHead n={num("adm-timeline")} title="Mốc thời gian" sub="Theo dõi các mốc quan trọng của đợt tuyển sinh." light />
          </div>
          <div className="adm-wrap adm-rail-wrap">
            <ol className="adm-rail adm-rail-time">
              {timeline.map((t, i) => (
                <li key={`${t.title}-${t.date}-${i}`}>
                  <Reveal i={i % 4}>
                    <div className="adm-time">
                      {t.date ? <time>{t.date}</time> : <time>{pad(i)}</time>}
                      {t.title ? <h3>{t.title}</h3> : null}
                      {t.content ? <p>{t.content}</p> : null}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ===== 05 hỏi đáp: tiêu đề dính + accordion ===== */}
      {faqs.length > 0 ? (
        <section className="adm-sec" id="adm-faq">
          <div className="adm-wrap adm-split">
            <div className="adm-split-side">
              <SectionHead n={num("adm-faq")} title="Câu hỏi thường gặp" sub="Một số câu hỏi trước khi bạn đăng ký." />
              <Reveal i={1}>
                <div className="adm-ask">
                  <strong>Chưa thấy câu trả lời?</strong>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  {hasFacebook ? <a href={facebook} target="_blank" rel="noreferrer">Nhắn qua Facebook</a> : null}
                </div>
              </Reveal>
            </div>
            <div className="adm-faq">
              {faqs.map((f, i) => (
                <Reveal i={i % 3} key={`${f.title}-${i}`}>
                  <details className="adm-faq-item">
                    <summary><span>{pad(i)}</span>{f.title}</summary>
                    {f.content ? <p>{f.content}</p> : null}
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== CTA cuối trang ===== */}
      {!isEmpty ? (
        <section className="adm-wrap adm-final-wrap">
          <Reveal>
            <div className="adm-final">
              <h2>Sẵn sàng tham gia CTIT?</h2>
              <p>Đăng ký hoặc nhắn cho CTIT — mọi câu hỏi đều được trả lời.</p>
              <div className="adm-cta">
                {status?.url ? <a className="adm-btn light" href={status.url} target="_blank" rel="noreferrer">Đăng ký ngay <Arrow /></a> : null}
                <a className="adm-btn outline" href={`mailto:${contact.email}`}>Gửi email</a>
                {hasFacebook ? <a className="adm-btn outline" href={facebook} target="_blank" rel="noreferrer">Facebook</a> : null}
              </div>
            </div>
          </Reveal>
        </section>
      ) : (
        <section className="adm-sec">
          <div className="adm-wrap adm-empty">
            Chưa có dữ liệu. Điền tab Admissions trong Google Sheet (cột <code>section</code>: status / step / requirement /
            track / timeline / faq) rồi kiểm tra <code>ADMISSIONS_SHEET_CSV_URL</code> trong <code>.env.local</code>.
          </div>
        </section>
      )}
    </>
  );
}
