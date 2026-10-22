import { expect, test } from "@playwright/test";

const ADMIN_PASSWORD = "e2e-password-123456"; // khớp với webServer.env trong playwright.config.ts
const basic = (password: string) => ({ Authorization: `Basic ${Buffer.from(`admin:${password}`).toString("base64")}` });

test.describe("header bảo mật", () => {
  test("trang chủ có CSP, chống nhúng iframe và không lộ x-powered-by", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(headers["content-security-policy"]).toContain("base-uri 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

// Bộ đếm chống dò mật khẩu nằm trong bộ nhớ của server và tính theo IP, nên các bài này chạy tuần tự và chỉ ở một project.
test.describe.serial("trang /admin", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Chỉ chạy một lần để không dùng chung bộ đếm khóa");
  });

  test("không có mật khẩu: 401 kèm hộp đăng nhập", async ({ request }) => {
    const response = await request.get("/admin");
    expect(response.status()).toBe(401);
    expect(response.headers()["www-authenticate"]).toContain("Basic");
    expect(response.headers()["cache-control"]).toContain("no-store");
  });

  test("đúng mật khẩu: vào được", async ({ request }) => {
    expect((await request.get("/admin", { headers: basic(ADMIN_PASSWORD) })).status()).toBe(200);
  });

  test("nút gửi cảnh báo thử: cần mật khẩu và cần cùng nguồn gốc (chống CSRF)", async ({ request, baseURL }) => {
    expect((await request.post("/admin/test-alert", { headers: { origin: baseURL! } })).status()).toBe(401);
    expect((await request.post("/admin/test-alert", { headers: { ...basic(ADMIN_PASSWORD), origin: "https://evil.example" } })).status()).toBe(403);
    expect((await request.post("/admin/test-alert", { headers: basic(ADMIN_PASSWORD) })).status()).toBe(403); // không có Origin
    const ok = await request.post("/admin/test-alert", { headers: { ...basic(ADMIN_PASSWORD), origin: baseURL! } });
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toEqual({ configured: false, sent: false }); // E2E không đặt ALERT_WEBHOOK_URL
  });

  test("sai 5 lần thì bị khóa (429), kể cả khi lần sau nhập đúng", async ({ request }) => {
    for (let i = 1; i <= 5; i++) expect((await request.get("/admin", { headers: basic(`sai-${i}`) })).status()).toBe(401);
    const locked = await request.get("/admin", { headers: basic("sai-6") });
    expect(locked.status()).toBe(429);
    expect(Number(locked.headers()["retry-after"])).toBeGreaterThan(0);
    expect((await request.get("/admin", { headers: basic(ADMIN_PASSWORD) })).status()).toBe(429);
  });
});

test.describe("API", () => {
  test("/api/health báo ok khi chưa cấu hình Sheet nào và không để lộ link", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.alerts).toBe(false);
    expect(body.version).toMatch(/^\d{4}\.\d{2}\.\d{2}/);
    expect(Object.keys(body.sheets)).toContain("events");
    expect(JSON.stringify(body)).not.toContain("docs.google.com");
  });

  test("/api/search trả danh sách có các trang chính", async ({ request }) => {
    const body = await (await request.get("/api/search")).json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((entry: { title: string }) => entry.title === "Tuyển sinh")).toBe(true);
  });
});
