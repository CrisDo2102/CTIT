"use client";

import { useEffect } from "react";

// Phần đi kèm ngăn kéo bộ lọc trên điện thoại: nền mờ bấm để đóng, phím Esc đóng, khóa cuộn trang phía sau.
// Trên máy tính (bộ lọc nằm cạnh kết quả) thì không làm gì.
export function FilterDrawerBackdrop({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 960px)").matches) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return open ? <button type="button" className="inv-backdrop" aria-label="Đóng bộ lọc" tabIndex={-1} onClick={onClose} /> : null;
}
