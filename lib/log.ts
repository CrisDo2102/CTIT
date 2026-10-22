// Nhật ký có cấu trúc: mỗi sự kiện là một dòng JSON để tìm/lọc được trong Vercel Logs
// (vd tìm `"event":"client_error"`). Chuỗi dài bị cắt để một lỗi lặp lại không làm đầy nhật ký.
export type LogLevel = "info" | "warn" | "error";

const MAX_VALUE = 500;

function clean(value: unknown): unknown {
  if (typeof value === "string") return value.length > MAX_VALUE ? `${value.slice(0, MAX_VALUE)}…` : value;
  return value;
}

export function logEvent(level: LogLevel, event: string, data: Record<string, unknown> = {}): void {
  const entry: Record<string, unknown> = { level, event, t: new Date().toISOString() };
  for (const [key, value] of Object.entries(data)) entry[key] = clean(value);
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
