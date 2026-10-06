"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Ảnh hiện đủ (contain) + nền mờ. Bấm vào ảnh là phóng to ngay (khoảng 3/4 màn hình).
// Đóng: bấm vào chỗ bất kỳ, bấm nút ✕ hoặc phím Esc.
// scope="card": bấm vào bất kỳ đâu trên thẻ (trừ phần tử có data-peek-skip, ví dụ nút "Đọc tiếp")
// đều phóng ảnh; dùng cho thẻ tiêu điểm, nơi ảnh nằm dưới lớp chữ.

type Props = {
  src: string;
  alt?: string;
  wrapperClass: string;
  bgClass: string;
  imgClass: string;
  scope?: "image" | "card";
};

export function PeekImage({ src, alt = "", wrapperClass, bgClass, imgClass, scope = "image" }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const target: HTMLElement =
      scope === "card" ? ((wrap.closest("a, article") as HTMLElement | null) ?? wrap) : wrap;

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (scope === "card" && el?.closest("[data-peek-skip]")) return; // để nút "Đọc tiếp" chuyển trang bình thường
      // Ảnh thường nằm trong thẻ <a>/<Link>: chặn để không bị chuyển trang.
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    };
    target.addEventListener("click", onClick, true);
    return () => target.removeEventListener("click", onClick, true);
  }, [scope]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const overlay = (
    <div
      className="peek-overlay"
      role="dialog"
      aria-label={alt || "Xem ảnh"}
      onClick={(e) => {
        // Portal vẫn nổi bọt sự kiện React lên thẻ <Link> cha, nên phải chặn để không bị chuyển trang.
        e.stopPropagation();
        e.preventDefault();
        setOpen(false);
      }}
    >
      <img className="peek-full" src={src} alt={alt} draggable={false} />
      <button
        type="button"
        className="peek-close"
        aria-label="Đóng ảnh"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(false);
        }}
      >
        ✕
      </button>
    </div>
  );

  return (
    <>
      <span ref={wrapRef} className={`${wrapperClass} peek`}>
        <img className={bgClass} src={src} alt="" aria-hidden="true" loading="lazy" draggable={false} />
        <img className={imgClass} src={src} alt={alt} loading="lazy" draggable={false} />
      </span>
      {open ? createPortal(overlay, document.body) : null}
    </>
  );
}
