"use client";

import { useEffect, useRef, useState } from "react";

// Nút "Sao chép link" của trang chi tiết (giống nút chia sẻ ở trang sản phẩm st.com).
export function CopyLink({ className = "btn ghost" }: { className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      // Bỏ #mục đang xem để link gửi đi mở ra đầu trang.
      const url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      await navigator.clipboard.writeText(url);
      setState("done");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {state === "done" ? "Đã sao chép ✓" : state === "error" ? "Không sao chép được" : "Sao chép link"}
    </button>
  );
}
