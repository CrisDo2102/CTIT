"use client";

import { useEffect, useRef, useState } from "react";

export type SubNavItem = { id: string; label: string };

// Thanh điều hướng trong trang (dính dưới header, như thanh "Overview / Documentation / Tools" của st.com).
// Làm sáng mục đang xem khi cuộn; bấm thì cuộn mượt tới phần tương ứng.
export function PageSubNav({ items, label = "Trong trang này" }: { items: SubNavItem[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLElement>(null);

  // Dính ngay dưới header, theo chiều cao thật của header (đổi theo kích thước màn hình).
  useEffect(() => {
    const place = () => {
      const header = document.querySelector<HTMLElement>(".header");
      if (navRef.current) navRef.current.style.top = `${header ? Math.round(header.getBoundingClientRect().height) : 0}px`;
    };
    place();
    addEventListener("resize", place);
    return () => removeEventListener("resize", place);
  }, []);

  useEffect(() => {
    const targets = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // Phần nằm cao nhất trong vùng nhìn thấy là phần đang đọc.
        const first = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
        if (first) setActive(first[0]);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const jump = (event: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  if (items.length < 2) return null;

  return (
    <nav className="subnav" aria-label={label} ref={navRef}>
      <div className="container subnav-inner">
        <span className="subnav-label">{label}</span>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={active === item.id ? "is-active" : undefined} aria-current={active === item.id ? "location" : undefined} onClick={(e) => jump(e, item.id)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
