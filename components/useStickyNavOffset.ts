"use client";

import { useEffect, useRef } from "react";

/**
 * Đo các thanh sticky nội trang thực sự được mount. Giá trị --subnav-h được
 * tổng hợp để scroll-padding chừa đủ chỗ cho mọi thanh, không chỉ thanh cuối.
 * --sticky-stack-before tính vị trí từng nav khi có nhiều nav trên một trang.
 * Không đọc kích thước trên render / server và không thêm thư viện bên ngoài.
 */
const registered = new Map<HTMLElement, { gap: number; resize: ResizeObserver | null }>();
let pending = 0;

function recompute() {
  pending = 0;
  const root = document.documentElement;
  const navs = [...registered.entries()]
    .filter(([node]) => node.isConnected && node.getClientRects().length > 0)
    .sort(([a], [b]) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 :
        b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : 0
    );

  let total = 0;
  for (const [node, { gap }] of navs) {
    node.style.setProperty("--sticky-stack-before", `${total}px`);
    total += Math.max(0, gap) + Math.round(node.getBoundingClientRect().height);
  }
  if (navs.length) root.style.setProperty("--subnav-h", `${total}px`);
  else root.style.removeProperty("--subnav-h");
}

function requestRecompute() {
  if (!pending) pending = window.requestAnimationFrame(recompute);
}

/** gap=12 cho pill; gap=0 cho PageSubNav sát ngay dưới header. */
export function useStickyNavOffset<T extends HTMLElement>(gap = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(requestRecompute)
      : null;
    registered.set(node, { gap, resize: observer });
    observer?.observe(node);
    window.addEventListener("resize", requestRecompute, { passive: true });
    requestRecompute();

    return () => {
      observer?.disconnect();
      registered.delete(node);
      node.style.removeProperty("--sticky-stack-before");
      window.removeEventListener("resize", requestRecompute);
      requestRecompute();
    };
  }, [gap]);

  return ref;
}
