// Nhật ký có cấu trúc: mỗi sự kiện là một dòng JSON để tìm/lọc được trong Vercel Logs
// (vd tìm `"event":"client_error"`). Chuỗi dài bị cắt để một lỗi lặp lại không làm đầy nhật ký.
export type LogLevel = "info" | "warn" | "error";

const MAX_VALUE = 500;

function clean(value: unknown): unknown {
  if (typeof value !== "string") return value;
  // Error messages come from the browser and must be treated as untrusted. Avoid accidentally
  // recording access tokens, cookie values or URL query strings in third-party log drains.
  const redacted = value
    .replace(/\b(Authorization|Cookie|Set-Cookie|token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;&]+/gi, "$1=[REDACTED]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]{8,}/gi, "Bearer [REDACTED]")
    .replace(/https?:\/\/[^\s<>\"']+/gi, (candidate) => {
      try {
        const url = new URL(candidate);
        return `${url.origin}${url.pathname}`; // never log query string, fragment or user:password
      } catch { return "[URL]"; }
    });
  return redacted.length > MAX_VALUE ? `${redacted.slice(0, MAX_VALUE)}…` : redacted;
}

export function logEvent(level: LogLevel, event: string, data: Record<string, unknown> = {}): void {
  const entry: Record<string, unknown> = { level, event, t: new Date().toISOString() };
  for (const [key, value] of Object.entries(data)) entry[key] = clean(value);
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
