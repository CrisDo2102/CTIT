import { expect, test } from "@playwright/test";
import { gotoHydrated } from "./helpers";

test.describe("báo lỗi từ trình duyệt", () => {
  test("lỗi JavaScript chưa xử lý được gửi về /api/report", async ({ page }) => {
    // Playwright không đọc được nội dung của yêu cầu beacon, nên ghi lại ngay lúc trang gọi sendBeacon.
    await page.addInitScript(() => {
      const w = window as unknown as { __beacons: { url: string; body: string }[] };
      w.__beacons = [];
      const original = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url, data) => {
        if (data instanceof Blob) void data.text().then((body) => w.__beacons.push({ url: String(url), body }));
        return original(url, data);
      };
    });
    await gotoHydrated(page, "/");
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error("e2e-loi-thu-nghiem");
      }, 0);
    });
    await expect.poll(() => page.evaluate(() => (window as unknown as { __beacons: unknown[] }).__beacons.length)).toBe(1);
    const [beacon] = await page.evaluate(() => (window as unknown as { __beacons: { url: string; body: string }[] }).__beacons);
    expect(beacon.url).toContain("/api/report");
    const body = JSON.parse(beacon.body);
    expect(body).toMatchObject({ type: "error", path: "/" });
    expect(body.message).toContain("e2e-loi-thu-nghiem");
    expect(JSON.stringify(body)).not.toMatch(/cookie|token|password/i); // chỉ thông tin kỹ thuật tối thiểu
  });

  test("cùng một lỗi lặp lại nhiều lần chỉ báo một lần", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __n: number }).__n = 0;
      const original = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url, data) => {
        (window as unknown as { __n: number }).__n++;
        return original(url, data);
      };
    });
    await gotoHydrated(page, "/");
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => setTimeout(() => { throw new Error("e2e-lap-lai"); }, 0));
    }
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as unknown as { __n: number }).__n)).toBe(1);
  });

  test("lỗi trình duyệt không phải của site (ResizeObserver) không bị báo", async ({ page }) => {
    await gotoHydrated(page, "/");
    let reports = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/api/report")) reports++;
    });
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error("ResizeObserver loop completed with undelivered notifications.");
      }, 0);
    });
    await page.waitForTimeout(600);
    expect(reports).toBe(0);
  });
});

test.describe("/api/report", () => {
  const valid = { type: "error", message: "e2e", path: "/events" };

  test("nhận báo cáo hợp lệ cùng nguồn gốc", async ({ request, baseURL }) => {
    const response = await request.post("/api/report", { data: valid, headers: { origin: baseURL! } });
    expect(response.status()).toBe(204);
  });

  test("chặn báo cáo từ trang khác", async ({ request }) => {
    expect((await request.post("/api/report", { data: valid, headers: { origin: "https://evil.example" } })).status()).toBe(403);
  });

  test("từ chối dữ liệu sai và dữ liệu quá lớn", async ({ request, baseURL }) => {
    const headers = { origin: baseURL! };
    expect((await request.post("/api/report", { data: { type: "hack", message: "x", path: "/" }, headers })).status()).toBe(400);
    expect((await request.post("/api/report", { data: { ...valid, stack: "a".repeat(5000) }, headers })).status()).toBe(413);
  });

  test("chỉ nhận POST", async ({ request }) => {
    expect((await request.get("/api/report")).status()).toBe(405);
  });
});

test.describe("điểm liên hệ bảo mật", () => {
  test("/.well-known/security.txt theo chuẩn RFC 9116 (có Contact và Expires còn hạn)", async ({ request }) => {
    const response = await request.get("/.well-known/security.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toMatch(/^Contact: mailto:.+@.+/m);
    const expires = text.match(/^Expires: (.+)$/m)?.[1];
    expect(expires, "thiếu Expires").toBeTruthy();
    expect(new Date(expires!).getTime()).toBeGreaterThan(Date.now());
  });
});
