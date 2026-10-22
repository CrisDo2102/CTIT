import { expect, test } from "@playwright/test";

// Ngân sách hiệu năng cho ảnh (xem thêm tests/unit/asset-budget.test.ts: giới hạn kích thước file trong public/images).
test.describe("ảnh và bộ đệm", () => {
  test("logo (tải trên mọi trang) nhẹ và được trình duyệt giữ lại, không phải hỏi lại mỗi lần", async ({ request }) => {
    const response = await request.get("/images/About/logo.png");
    expect(response.status()).toBe(200);
    expect((await response.body()).length).toBeLessThan(150 * 1024);
    expect(response.headers()["cache-control"]).toContain("max-age=86400");
    expect(response.headers()["cache-control"]).toContain("stale-while-revalidate");
    expect(response.headers()["cache-control"]).not.toContain("immutable"); // tên file không có mã băm, thay ảnh phải có hiệu lực trong ngày
  });

  test("logo ở chân trang có kích thước khai báo, tải lười (không làm bố cục nhảy)", async ({ page }) => {
    await page.goto("/");
    const logo = page.locator("img.footer-logo");
    await expect(logo).toHaveAttribute("width", "30");
    await expect(logo).toHaveAttribute("height", "30");
    await expect(logo).toHaveAttribute("loading", "lazy");
  });
});

// Khi Sheet chưa có hướng hoạt động nào, trang chủ vẫn phải chạy: nút Khám phá trỏ tới phần Khám phá CTIT.
test.describe("trang chủ khi chưa có dữ liệu", () => {
  test("không hiện khối hướng hoạt động, nút Khám phá cuộn tới #kham-pha có thật", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ct-panel")).toHaveCount(0);
    const explore = page.locator(".ti-actions a.is-ghost").first();
    await expect(explore).toHaveAttribute("href", "#kham-pha");
    await expect(page.locator("#kham-pha")).toHaveCount(1);
  });
});
