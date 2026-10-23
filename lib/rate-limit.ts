// Giới hạn tần suất theo khoá (thường là địa chỉ IP), cửa sổ trượt, lưu trong bộ nhớ tiến trình.
// Trên serverless mỗi instance có bộ đếm riêng nên đây là lớp chặn "hết sức có thể"; chặn tuyệt đối cần Vercel Firewall.
const MAX_KEYS = 5000;

export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return {
    /** Ghi nhận một lần gọi; trả false nếu khoá này đã vượt giới hạn trong cửa sổ. */
    allow(key: string, now = Date.now()): boolean {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > MAX_KEYS) {
        // Giữ bộ nhớ có trần: bỏ bớt các khoá cũ nhất.
        for (const oldest of [...hits.keys()].slice(0, hits.size - MAX_KEYS)) hits.delete(oldest);
      }
      return true;
    },
    reset(): void {
      hits.clear();
    }
  };
}

export function clientIp(headers: Headers): string {
  const trusted = process.env.VERCEL ? headers.get("x-vercel-forwarded-for") : headers.get("x-forwarded-for");
  const raw = trusted?.split(",")[0] || (!process.env.VERCEL ? headers.get("x-real-ip") : null) || "unknown";
  return /^[a-fA-F0-9:.]{3,45}$/.test(raw.trim()) ? raw.trim() : "unknown";
}
