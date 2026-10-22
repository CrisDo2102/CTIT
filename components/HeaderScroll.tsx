"use client";

import { useEffect } from "react";

// Header "nổi" trên ảnh hero ở trang chủ: lúc ở đầu trang trong suốt, cuộn xuống một chút thì chuyển sang nền kính mờ và đổi màu chữ.
// Chỉ thêm/bớt class `is-scrolled` trên <header> (CSS lo phần còn lại), và ghi chiều cao dải trên cùng vào --strip-h
// để header nổi nằm ngay dưới dải đó rồi trượt lên sát mép khi cuộn.
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header.is-overlay");
    const strip = document.querySelector<HTMLElement>(".top-strip.is-overlay");
    if (!header) return;

    const THRESHOLD = 24;
    let frame = 0;
    const update = () => {
      frame = 0;
      header.classList.toggle("is-scrolled", window.scrollY > THRESHOLD);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const measure = () => document.documentElement.style.setProperty("--strip-h", `${strip ? Math.round(strip.getBoundingClientRect().height) : 0}px`);

    update();
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty("--strip-h");
    };
  }, []);
  return null;
}
