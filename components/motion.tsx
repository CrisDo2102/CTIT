"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// ===== Chuyển động dùng chung cho mọi trang =====
// Lấy ý tưởng từ Reveal / useCountUp của trang Research, tách ra để trang nào cũng dùng được.
// CSS tương ứng nằm cuối app/globals.css (class .reveal / .is-in).

const reduceMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Hiện dần khi cuộn tới.
 * - Phần tử đã nằm trong màn hình lúc tải trang thì giữ nguyên (không bị nháy ẩn rồi hiện).
 * - Không có JS / người dùng bật "giảm chuyển động" thì nội dung luôn hiển thị bình thường.
 */
export function Reveal({
  children,
  i = 0,
  className = ""
}: {
  children: ReactNode;
  i?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion()) return;
    if (node.getBoundingClientRect().top < innerHeight * 0.92) return;

    node.classList.add("reveal");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={{ "--i": i } as CSSProperties}>
      {children}
    </div>
  );
}

/** Đếm số từ 0 → target khi `active` bật (easeOutCubic, 1 giây). */
export function useCountUp(target: number, active: boolean, decimals = 0) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active || target === 0 || reduceMotion()) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1000);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Number((eased * target).toFixed(decimals)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    setValue(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, decimals]);

  return value;
}

/**
 * Hiển thị một con số có đếm lên, giữ nguyên tiền tố/hậu tố.
 * Ví dụ "120+" -> đếm 0..120 rồi thêm "+"; "98%" -> "98%"; "Hàng chục" (không có số) -> in nguyên văn.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  const match = value.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/);
  const prefix = match?.[1] ?? "";
  const raw = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  const decimals = raw.includes(".") || raw.includes(",") ? raw.split(/[.,]/)[1].length : 0;
  const target = match ? parseFloat(raw.replace(",", ".")) : 0;
  const shown = useCountUp(target, active, decimals);

  useEffect(() => {
    const node = ref.current;
    if (!node || !match) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!match) return <strong ref={ref}>{value}</strong>;
  return (
    <strong ref={ref}>
      {prefix}
      {decimals ? shown.toFixed(decimals) : shown}
      {suffix}
    </strong>
  );
}
