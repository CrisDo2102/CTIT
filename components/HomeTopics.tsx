"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";

export type TopicCard = { title: string; meta?: string; text?: string; href: string; external?: boolean; image?: string };
export type Topic = { id: string; label: string; blurb: string; href: string; cta: string; cards: TopicCard[] };

// Khối có tab "Tài nguyên cho bạn" (lấy ý tưởng từ "Products & innovations for you" của st.com):
// chọn tab → đổi phần mô tả + 3 thẻ mới nhất của nhóm đó. Dùng được bằng phím ←/→/Home/End.
export function HomeTopics({ topics }: { topics: Topic[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (topics.length === 0) return null;
  const topic = topics[active] ?? topics[0];

  const move = (i: number) => {
    const next = (i + topics.length) % topics.length;
    setActive(next);
    refs.current[next]?.focus();
  };
  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") { event.preventDefault(); move(active + 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); move(active - 1); }
    else if (event.key === "Home") { event.preventDefault(); move(0); }
    else if (event.key === "End") { event.preventDefault(); move(topics.length - 1); }
  };

  return (
    <div className="topics">
      <div className="topics-tabs" role="tablist" aria-label="Nhóm tài nguyên" onKeyDown={onKey}>
        {topics.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            id={`topic-tab-${t.id}`}
            aria-selected={i === active}
            aria-controls={`topic-panel-${t.id}`}
            tabIndex={i === active ? 0 : -1}
            className={i === active ? "is-active" : undefined}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="topics-panel" role="tabpanel" id={`topic-panel-${topic.id}`} aria-labelledby={`topic-tab-${topic.id}`} key={topic.id}>
        <div className="topics-intro">
          <h3>{topic.label}</h3>
          <p>{topic.blurb}</p>
          <Link className="ti-link" href={topic.href}>{topic.cta} <span aria-hidden="true">→</span></Link>
        </div>
        <ul className="topics-cards">
          {topic.cards.map((card, i) => {
            const body = (
              <>
                <span className="topics-media" aria-hidden="true">
                  <SafeImage src={card.image || ""} alt="" loading="lazy" fallback={<b>{(card.title || "?").charAt(0).toUpperCase()}</b>} />
                </span>
                {card.meta ? <small>{card.meta}</small> : null}
                <strong>{card.title}</strong>
                {card.text ? <span className="topics-text">{card.text}</span> : null}
                <i aria-hidden="true">{card.external ? "↗" : "→"}</i>
              </>
            );
            return (
              <li key={`${card.title}-${i}`}>
                {card.external ? (
                  <a className="topics-card" href={card.href} target="_blank" rel="noreferrer">{body}</a>
                ) : (
                  <Link className="topics-card" href={card.href}>{body}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
