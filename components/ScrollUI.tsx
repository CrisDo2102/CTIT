"use client";

import { useEffect, useRef, useState } from "react";

// Thanh tiến độ cuộn (mép trên) + nút "lên đầu trang" — gắn 1 lần ở app/layout.tsx nên mọi trang đều có.
export function ScrollUI() {
  const bar = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setShowTop(scrollY > 640);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><div ref={bar} /></div>
      <button
        type="button"
        className={`to-top${showTop ? " is-on" : ""}`}
        aria-label="Lên đầu trang"
        tabIndex={showTop ? 0 : -1}
        onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </>
  );
}
