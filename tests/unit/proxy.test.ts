import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let proxy: (request: NextRequest) => Promise<Response>;
let n = 0;
const basic = (password: string) => ({ authorization: `Basic ${Buffer.from(`admin:${password}`).toString("base64")}` });
const call = (headers: Record<string, string> = {}) => proxy(new NextRequest("http://localhost/admin", { headers: { "x-forwarded-for": `192.0.2.${++n}`, ...headers } }));

beforeEach(async () => {
  vi.resetModules();
  ({ proxy } = await import("@/proxy"));
});
afterEach(() => vi.unstubAllEnvs());

describe("proxy /admin: cấu hình mật khẩu ở production", () => {
  it("chưa đặt mật khẩu: tắt hẳn (503)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect((await call()).status).toBe(503);
  });
  it("mật khẩu quá ngắn: tắt (503)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "ngan123");
    expect((await call()).status).toBe(503);
  });
  it.each(["change-this-to-a-long-password", "Password123456789", "admin-admin-admin-1", "your-password-here-please", "12345678901234567890", "Example-Example-1234"])("mật khẩu mẫu hoặc dễ đoán %s: tắt (503)", async (password) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", password);
    const response = await call(basic(password));
    expect(response.status).toBe(503);
    expect(await response.text()).toContain("giá trị mẫu");
  });
  it("mật khẩu ngẫu nhiên đủ dài: 401 khi chưa đăng nhập, vào được khi đúng, 401 khi sai", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "k7Qm2xVp9LrT4wZb8NcY");
    expect((await call()).status).toBe(401);
    expect((await call(basic("k7Qm2xVp9LrT4wZb8NcY"))).status).toBe(200);
    expect((await call(basic("sai-mat-khau-day"))).status).toBe(401);
  });
  it("khi chạy thử (dev) chưa đặt mật khẩu thì cho vào để tiện sửa", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect((await call()).status).toBe(200);
  });
  it("sai 5 lần liên tiếp thì khóa IP đó (429), IP khác không bị ảnh hưởng", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "k7Qm2xVp9LrT4wZb8NcY");
    const ip = { "x-forwarded-for": "198.51.100.77" };
    for (let i = 0; i < 5; i++) expect((await call({ ...ip, ...basic(`sai-${i}`) })).status).toBe(401);
    expect((await call({ ...ip, ...basic("sai-6") })).status).toBe(429);
    expect((await call({ ...ip, ...basic("k7Qm2xVp9LrT4wZb8NcY") })).status).toBe(429);
    expect((await call(basic("k7Qm2xVp9LrT4wZb8NcY"))).status).toBe(200);
  });
});
