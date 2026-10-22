import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

test.describe("Quay lại danh sách", () => {
  test('"← Inventory" từ trang chi tiết quay về đúng bộ lọc', async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory?cat=D%E1%BB%A5ng+c%E1%BB%A5");
    await page.locator("article.inventory-card h3 a").first().click();
    await expect(page).toHaveURL(/\/resources\/inventory\/.+/);
    const back = page.locator("a.ph-back");
    await expect(back).toContainText("giữ bộ lọc");
    await expect(back).toHaveAttribute("href", /cat=D%E1%BB%A5ng\+c%E1%BB%A5/);
    await back.click();
    await expect(page.locator(".inventory-result-line [role=status] strong").first()).toHaveText("5");
  });

  test("nút Back của trình duyệt trả về đúng vị trí cuộn", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => window.scrollY);
    await page.locator("article.inventory-card h3 a").nth(8).scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => window.scrollY);
    await page.locator("article.inventory-card h3 a").nth(8).click();
    await expect(page).toHaveURL(/\/resources\/inventory\/.+/);
    await page.goBack();
    await expect(page.locator("article.inventory-card").first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeGreaterThan(Math.min(before, y) - 250);
  });
});
