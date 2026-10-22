"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion";
import { nav } from "@/lib/site-config";

// Ảnh của từng ô, theo đường dẫn mục (/admissions -> mọi ảnh trong tab Tuyển sinh...).
// Do trang chủ (server) gom từ Google Sheet rồi truyền xuống; mục nào không có ảnh thì hiện số thứ tự.
export type TileImages = Record<string, string[]>;

// Mục có ảnh là logo: hiện đủ (contain) trên nền sáng thay vì cắt (cover).
const CONTAIN = new Set(["/about"]);
const DOTS_MAX = 8;

// Ảnh tự đổi mỗi vài giây (so le giữa các ô để không đổi cùng lúc), chuyển bằng hiệu ứng mờ dần.
// Dừng khi bật "giảm chuyển động" hoặc khi tab đang ẩn. Ảnh lỗi tự bị loại khỏi vòng xoay.
function TileMedia({ href, index, images }: { href: string; index: number; images: string[] }) {
  const [list, setList] = useState(images);
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const curRef = useRef(0);
  const sizeRef = useRef(images.length);
  // Ghi vào ref trong effect (không ghi lúc render) để bộ đếm giờ luôn đọc được số ảnh còn lại.
  useEffect(() => {
    sizeRef.current = list.length;
  }, [list.length]);

  useEffect(() => {
    if (list.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (document.visibilityState === "visible" && sizeRef.current > 1) {
        const next = (curRef.current + 1) % sizeRef.current;
        setPrev(curRef.current);
        curRef.current = next;
        setCur(next);
      }
      timer = setTimeout(tick, 3800 + (index % 4) * 450);
    };
    timer = setTimeout(tick, 2200 + index * 350);
    return () => clearTimeout(timer);
  }, [list.length > 1, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tải trước ảnh kế tiếp để lúc chuyển không bị chớp.
  useEffect(() => {
    if (list.length > 1) new Image().src = list[(cur + 1) % list.length];
  }, [cur, list]);

  const dropBroken = (src: string) => setList((current) => current.filter((entry) => entry !== src));

  // Sau khi loại ảnh lỗi: giữ vị trí hiện tại hợp lệ và bỏ ảnh "cũ" đang chờ mờ dần.
  useEffect(() => {
    curRef.current = list.length ? curRef.current % list.length : 0;
    setCur(curRef.current);
    setPrev(null);
  }, [list.length]);

  const number = String(index + 1).padStart(2, "0");
  if (list.length === 0) return <b>{number}</b>;

  const safeCur = cur % list.length;
  const safePrev = prev !== null && prev !== safeCur && prev < list.length ? prev : null;
  const fit = CONTAIN.has(href) ? " is-contain" : "";
  const dots = Math.min(list.length, DOTS_MAX);

  return (
    <>
      {safePrev !== null ? <img key={list[safePrev]} className={`ti-slide-img${fit}`} src={list[safePrev]} alt="" aria-hidden="true" onError={() => dropBroken(list[safePrev])} /> : null}
      <img
        key={list[safeCur]}
        className={`ti-slide-img${fit}${safePrev !== null ? " is-in" : ""}`}
        src={list[safeCur]}
        alt=""
        aria-hidden="true"
        loading={index < 4 ? "eager" : "lazy"}
        onError={() => dropBroken(list[safeCur])}
      />
      <span className="ti-tile-num">{number}</span>
      {list.length > 1 ? (
        <span className="ti-tile-dots" aria-hidden="true">
          {Array.from({ length: dots }, (_, i) => (
            <i key={i} className={i === safeCur % dots ? "is-on" : undefined} />
          ))}
        </span>
      ) : null}
    </>
  );
}

// Lưới các khu vực chính theo kiểu ô "Applications" của ti.com: ảnh trên, tiêu đề + mô tả, dòng "Khám phá … →" dưới cùng.
export function HomeBento({ images = {} }: { images?: TileImages }) {
  return (
    <div className="ti-tiles">
      {nav.map((item, index) => (
        <Reveal key={item.href} i={index} className="ti-tile-cell">
          <Link href={item.href} className="ti-tile" style={{ "--h": 235 + index * 14 } as React.CSSProperties}>
            <span className={`ti-tile-media${CONTAIN.has(item.href) ? " is-contain" : ""}`} aria-hidden="true">
              <TileMedia href={item.href} index={index} images={images[item.href] ?? []} />
            </span>
            <span className="ti-tile-body">
              <small>{item.en}</small>
              <strong>{item.label}</strong>
              <span>{item.intro}</span>
            </span>
            <span className="ti-tile-cta">
              Khám phá {item.label.toLowerCase()} <i aria-hidden="true">→</i>
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
