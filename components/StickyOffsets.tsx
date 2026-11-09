"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Đo chiều cao thật của header dính và ghi vào biến CSS --header-h. Các thanh dính khác (thanh con trong trang,
// thanh Bộ lọc trên điện thoại) và scroll-padding dùng biến này, để phần tử đang focus bằng bàn phím
// không bị thanh dính che mất (WCAG 2.2, 2.4.11 Focus Not Obscured).
export function StickyOffsets() {
  const pathname = usePathname();
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header");
    if (!header) return;
    const root = document.documentElement;
    const apply = () => root.style.setProperty("--header-h", `${Math.round(header.getBoundingClientRect().height)}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--header-h");
    };
  }, [pathname]); // Header theo từng route có thể thay DOM node khi điều hướng bằng Next.js.
  return null;
}
