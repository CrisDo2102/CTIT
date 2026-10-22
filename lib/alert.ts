import { logEvent } from "@/lib/log";

// Gửi cảnh báo tới một webhook (Discord / Slack / bất kỳ dịch vụ nhận JSON) khi có lỗi cần người xử lý.
// Cấu hình bằng biến môi trường ALERT_WEBHOOK_URL (không đặt thì chỉ ghi nhật ký, không gửi đi đâu).
//
// Chống "bão cảnh báo" (và chống người lạ cố tình làm đầy kênh):
//  - cùng một lỗi (fingerprint) chỉ gửi tối đa một lần mỗi 15 phút;
//  - tổng cộng tối đa 20 tin mỗi giờ, kể cả khi fingerprint khác nhau.
// Bộ đếm nằm trong bộ nhớ của tiến trình nên trên serverless là "hết sức có thể", chưa phải giới hạn tuyệt đối.

const SAME_ALERT_MS = 15 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 20;
const SEND_TIMEOUT_MS = 5000;

const lastSent = new Map<string, number>();
let sentTimes: number[] = [];

/** Chỉ dùng trong kiểm thử. */
export function resetAlertState(): void {
  lastSent.clear();
  sentTimes = [];
}

/** https, không phải địa chỉ nội bộ, không kèm tài khoản. */
export function isSafeWebhookUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return false;
    if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) || host === "[::1]") return false;
    return true;
  } catch {
    return false;
  }
}

function bodyFor(url: URL, text: string): string {
  const host = url.hostname.toLowerCase();
  if (host.endsWith("discord.com") || host.endsWith("discordapp.com")) return JSON.stringify({ content: text.slice(0, 1900) });
  return JSON.stringify({ text });
}

export type AlertInput = {
  title: string;
  detail?: string;
  /** Khoá gom nhóm: cùng khoá thì không gửi lặp trong 15 phút. */
  fingerprint: string;
  level?: "warn" | "error";
  /** Bỏ qua giới hạn tần suất (chỉ dùng cho nút "gửi thử" của admin). */
  force?: boolean;
};

/** Trả true nếu đã gửi. Không bao giờ ném lỗi: cảnh báo hỏng không được làm hỏng trang. */
export async function notify(input: AlertInput): Promise<boolean> {
  const webhook = process.env.ALERT_WEBHOOK_URL;
  const level = input.level ?? "error";
  logEvent(level, "alert", { title: input.title, detail: input.detail, fingerprint: input.fingerprint });
  if (!webhook) return false;
  if (!isSafeWebhookUrl(webhook)) {
    logEvent("warn", "alert_webhook_rejected", { reason: "ALERT_WEBHOOK_URL phải là https và không phải địa chỉ nội bộ" });
    return false;
  }

  const now = Date.now();
  if (!input.force) {
    const previous = lastSent.get(input.fingerprint);
    if (previous !== undefined && now - previous < SAME_ALERT_MS) return false;
    sentTimes = sentTimes.filter((time) => now - time < WINDOW_MS);
    if (sentTimes.length >= MAX_PER_WINDOW) return false;
  }

  const site = process.env.NEXT_PUBLIC_SITE_NAME ?? "CTIT";
  const text = `${level === "error" ? "🔴" : "🟠"} [${site}] ${input.title}${input.detail ? `\n${input.detail}` : ""}`;
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyFor(new URL(webhook), text),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
    });
    if (!response.ok) {
      logEvent("warn", "alert_send_failed", { status: response.status });
      return false;
    }
    lastSent.set(input.fingerprint, now);
    sentTimes.push(now);
    return true;
  } catch (error) {
    logEvent("warn", "alert_send_failed", { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
