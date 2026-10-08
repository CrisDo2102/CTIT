"use client";

import Link from "next/link";
import { useSaved, type SavedItem } from "@/lib/saved";

type Props = {
  item: Omit<SavedItem, "at">;
  /** "pill" = nút có chữ (trang chi tiết), mặc định là nút sao nhỏ. */
  variant?: "icon" | "pill";
  className?: string;
};

// Nút ★ lưu mục vào danh sách "Đã lưu" của người xem (lưu trong trình duyệt).
export function SaveButton({ item, variant = "icon", className = "" }: Props) {
  const { has, toggle } = useSaved();
  const saved = has(item.id);
  const label = saved ? "Bỏ lưu" : "Lưu lại";

  return (
    <button
      type="button"
      className={`save-btn${variant === "pill" ? " is-pill" : ""}${saved ? " is-saved" : ""} ${className}`.trim()}
      aria-pressed={saved}
      aria-label={`${label}: ${item.title}`}
      title={label}
      onClick={(event) => {
        // Nút có thể nằm trong thẻ <a>: không cho bấm sao mà chuyển trang.
        event.preventDefault();
        event.stopPropagation();
        toggle(item);
      }}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
      </svg>
      {variant === "pill" ? <span>{saved ? "Đã lưu" : "Lưu lại"}</span> : null}
    </button>
  );
}

// Liên kết "Đã lưu (n)" ở header.
export function SavedLink({ className = "" }: { className?: string }) {
  const { items } = useSaved();
  return (
    <Link href="/saved" className={className}>
      ★ Đã lưu{items.length > 0 ? ` (${items.length})` : ""}
    </Link>
  );
}
