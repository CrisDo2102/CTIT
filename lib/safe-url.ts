// Hàm thuần (chạy được ở server lẫn client) để lọc link lấy từ Google Sheet hoặc localStorage.
// Người sửa Sheet có thể gõ nhầm (hoặc cố ý) "javascript:...", "data:..." vào ô url; mọi link
// đi qua đây trước khi thành href/src nên chỉ http(s) mới lọt qua.

/** Chỉ nhận http:// hoặc https:// hợp lệ. Trả về chuỗi rỗng nếu không an toàn. */
export function safeHttpUrl(value: string | undefined | null): string {
  const raw = (value ?? "").trim();
  if (!raw || raw.length > 2048 || /[\u0000-\u001f\u007f\s]/.test(raw)) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    if (url.username || url.password) return ""; // chặn kiểu https://google.com@evil.com
    return url.toString();
  } catch {
    return "";
  }
}

/** Link nội bộ ("/resources/...") hoặc http(s). "//evil.com" và "javascript:" bị loại. */
export function safeHref(value: string | undefined | null): string {
  const raw = (value ?? "").trim();
  if (/^\/(?![/\\])/.test(raw) && raw.length <= 2048 && !/[\u0000-\u001f\u007f]/.test(raw)) return raw;
  return safeHttpUrl(raw);
}

/** Lọc trùng theo khoá, giữ phần tử xuất hiện đầu tiên (thứ tự trong Sheet không đổi). */
export function dedupeBy<T>(items: T[], keyOf: (item: T) => string): { items: T[]; removed: number } {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return { items: out, removed: items.length - out.length };
}
