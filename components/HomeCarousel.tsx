"use client";

import Link from "next/link";
import { useState } from "react";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  text?: string;
  cta: string;
  href: string;
  external?: boolean;
  image?: string;
};

// Carousel đầu trang chủ (bố cục theo ti.com): ảnh tràn khung, chữ bên trái, mỗi slide 1 nút hành động.
// Tự chuyển slide khi thanh tiến độ chạy xong (onAnimationEnd) nên tạm dừng/rê chuột là dừng đúng chỗ.
// Bật "giảm chuyển động" thì không tự chạy, chỉ chuyển bằng nút.
export function HomeCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const count = slides.length;
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <section
      className="ti-hero"
      aria-roledescription="carousel"
      aria-label="Nổi bật"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="ti-slides" aria-live={paused || hover ? "polite" : "off"}>
        {slides.map((slide, i) => {
          const active = i === index;
          const Cta = slide.external ? "a" : Link;
          const extra = slide.external ? { target: "_blank", rel: "noreferrer" } : {};
          return (
            <article
              key={`${slide.title}-${i}`}
              className={`ti-slide${active ? " is-active" : ""}`}
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              inert={!active}
            >
              {slide.image ? <img className="ti-slide-bg" src={slide.image} alt="" loading={i === 0 ? "eager" : "lazy"} /> : null}
              <div className="container ti-slide-inner">
                <div className="ti-slide-copy">
                  <p className="ti-eyebrow">{slide.eyebrow}</p>
                  <h1 className="ti-title">{slide.title}</h1>
                  {slide.text ? <p className="ti-text">{slide.text}</p> : null}
                  <Cta className="ti-cta" href={slide.href} {...extra}>
                    {slide.cta} <span aria-hidden="true">→</span>
                  </Cta>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="container ti-controls">
          <button type="button" className="ti-btn" onClick={() => setPaused((v) => !v)} aria-label={paused ? "Tiếp tục tự chuyển" : "Tạm dừng tự chuyển"}>
            {paused ? "▶" : "❚❚"}
          </button>
          <div className="ti-dots" role="tablist" aria-label="Chọn slide">
            {slides.map((slide, i) => (
              <button
                key={`${slide.title}-${i}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${slide.eyebrow}`}
                className={`ti-dot${i === index ? " is-active" : ""}${paused || hover ? " is-paused" : ""}`}
                onClick={() => go(i)}
              >
                <i onAnimationEnd={() => i === index && go(index + 1)} />
              </button>
            ))}
          </div>
          <button type="button" className="ti-btn" onClick={() => go(index - 1)} aria-label="Slide trước">←</button>
          <button type="button" className="ti-btn" onClick={() => go(index + 1)} aria-label="Slide sau">→</button>
        </div>
      ) : null}
    </section>
  );
}
