// Gửi báo lỗi từ trình duyệt về /api/report (ghi nhật ký + cảnh báo cho người vận hành).
// Chỉ gửi thông tin kỹ thuật tối thiểu: loại lỗi, nội dung lỗi, dấu vết, đường dẫn trang (không kèm tham số trên link),
// mã lỗi của Next. Không gửi cookie, dữ liệu nhập, hay thông tin người dùng.
export type ReportType = "error" | "unhandledrejection" | "boundary";

// Những "lỗi" không phải lỗi của site: trình duyệt hoặc tiện ích gây ra, hoặc trang cũ sau khi mình vừa cập nhật.
const IGNORE = [/ResizeObserver loop/i, /^Script error\.?$/i, /Non-Error promise rejection/i, /Loading chunk .* failed/i, /ChunkLoadError/i, /Failed to fetch dynamically imported module/i];
const MAX_PER_PAGE = 5;

const seen = new Set<string>();
let sent = 0;

export function reportClientError(type: ReportType, error: unknown, extra: { digest?: string } = {}): boolean {
  if (typeof window === "undefined") return false;
  const err = error instanceof Error ? error : new Error(typeof error === "string" ? error : "Lỗi không rõ");
  const message = (err.message || "Lỗi không rõ").slice(0, 300);
  if (IGNORE.some((pattern) => pattern.test(message))) return false;
  const key = `${type}:${message}`;
  if (seen.has(key) || sent >= MAX_PER_PAGE) return false;
  seen.add(key);
  sent += 1;

  const body = JSON.stringify({ type, message, stack: err.stack?.slice(0, 800), path: window.location.pathname, digest: extra.digest });
  try {
    if (navigator.sendBeacon?.("/api/report", new Blob([body], { type: "application/json" }))) return true;
    void fetch("/api/report", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/** Chỉ dùng trong kiểm thử. */
export function resetReportState(): void {
  seen.clear();
  sent = 0;
}
