"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TOAST_EVENT, type ToastDetail } from "@/lib/toast";

// Thông báo có nút bấm (Hoàn tác) không được biến mất quá nhanh: người đọc chậm, người dùng bàn phím hay trình đọc màn hình cần thời gian.
// Hiện 8 giây, DỪNG đếm khi rê chuột hoặc focus vào thông báo, rời ra thì còn 3 giây (WCAG 2.2.1 Timing Adjustable).
const SHOW_MS = 8000;
const RESUME_MS = 3000;

// Một thông báo tại một thời điểm: cái mới thay cái cũ. Trình đọc màn hình nghe được (role="status").
export function ToastHost() {
  const [toast, setToast] = useState<ToastDetail | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const start = (ms: number) => {
    stop();
    timer.current = setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    const onToast = (event: Event) => {
      setToast((event as CustomEvent<ToastDetail>).detail);
      start(SHOW_MS);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      stop();
    };
  }, []);

  const dismiss = () => setToast(null);

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toast ? (
        <div className="toast" key={toast.message} onMouseEnter={stop} onMouseLeave={() => start(RESUME_MS)} onFocus={stop} onBlur={() => start(RESUME_MS)}>
          <span>{toast.message}</span>
          {toast.action ? (
            <button type="button" onClick={() => { toast.action?.run(); dismiss(); }}>{toast.action.label}</button>
          ) : null}
          {toast.link ? <Link href={toast.link.href} onClick={dismiss}>{toast.link.label}</Link> : null}
          <button type="button" className="toast-x" onClick={dismiss} aria-label="Đóng thông báo">✕</button>
        </div>
      ) : null}
    </div>
  );
}
