"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Thanh tiến trình mảnh ở mép trên khi chuyển trang: bấm link nội bộ là chạy, trang mới hiện ra thì chạy nốt rồi mờ đi.
// Có chữ "đang tải" cho trình đọc màn hình. Không cần thư viện ngoài.
type Phase = "idle" | "loading" | "done";

export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const here = useRef(`${pathname}?${search}`);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Bấm link nội bộ (cùng tab, không phím bổ trợ, khác địa chỉ hiện tại) thì bắt đầu chạy.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // cùng trang / chỉ đổi #mục
      clearTimers();
      setPhase("loading");
      // Phòng khi trang không đổi địa chỉ (lỗi mạng, bị chặn): tự tắt sau 12 giây.
      timers.current.push(setTimeout(() => setPhase("idle"), 12_000));
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimers();
    };
  }, []);

  // Địa chỉ đổi nghĩa là trang mới đã sẵn sàng: chạy nốt, rồi mờ đi.
  useEffect(() => {
    const now = `${pathname}?${search}`;
    if (now === here.current) return;
    here.current = now;
    clearTimers();
    setPhase("done");
    timers.current.push(setTimeout(() => setPhase("idle"), 450));
  }, [pathname, search]);

  return (
    <div className={`route-progress is-${phase}`} role="progressbar" aria-hidden={phase === "idle"} aria-label="Đang tải trang">
      <i />
    </div>
  );
}
