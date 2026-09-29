"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollUp() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      className={`scroll-to-top ${visible ? "scroll-to-top--visible" : ""}`}
      onClick={scrollUp}
      aria-label="Cuộn về đầu trang"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="scroll-to-top-icon">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
