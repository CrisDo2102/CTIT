"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client";

// Bắt lỗi JavaScript không ai xử lý và lời hứa (promise) bị từ chối, báo về máy chủ. Không hiển thị gì.
export function ErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => reportClientError("error", event.error ?? event.message);
    const onRejection = (event: PromiseRejectionEvent) => reportClientError("unhandledrejection", event.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
