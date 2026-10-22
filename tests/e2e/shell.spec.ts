import { expect, test } from "@playwright/test";

test.describe("khung trang", () => {
  test("trang chủ có tiêu đề, menu (máy tính), nút tìm kiếm và số phiên bản ở chân trang", async ({ page, isMobile }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("CTIT");
    if (!isMobile) await expect(page.locator(".mainnav > a, .nav-dropdown-trigger")).toHaveCount(8);
    await expect(page.getByRole("button", { name: /Tìm kiếm/ }).first()).toBeVisible();
    await expect(page.locator(".foot-version")).toContainText(/v\d{4}\.\d{2}\.\d{2}/);
  });

  for (const [path, title] of [
    ["/about", "Giới thiệu · CTIT"],
    ["/events", "Sự kiện · CTIT"],
    ["/resources/documents", "Tài liệu · CTIT"],
    ["/resources/inventory", "Inventory · CTIT"],
    ["/saved", "Đã lưu · CTIT"],
    ["/changelog", "Có gì mới · CTIT"]
  ] as const) {
    test(`${path} có tiêu đề riêng`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
    });
  }

  test("trang không tồn tại trả 404 và có lối tìm tiếp", async ({ page }) => {
    const response = await page.goto("/khong-co-trang-nay");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("button", { name: /Tìm kiếm/ }).first()).toBeVisible();
  });

  test("Sheet trống: người xem thấy lời nhắn thân thiện, không thấy câu dành cho dev", async ({ page }) => {
    for (const path of ["/events", "/news", "/resources/documents"]) {
      await page.goto(path);
      const body = await page.locator("body").innerText();
      expect(body, path).not.toContain(".env.local");
      expect(body, path).not.toContain("SHEET_CSV_URL");
    }
    await page.goto("/events");
    await expect(page.getByText(/đang được cập nhật/).first()).toBeVisible();
  });

  for (const path of ["/", "/about", "/events", "/resources", "/resources/documents", "/saved", "/changelog"]) {
    test(`${path} không bị tràn ngang`, async ({ page }) => {
      await page.goto(path);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });
  }
});
