import { expect, test, type Page } from "@playwright/test";
import { gotoHydrated } from "./helpers";

const dialog = (page: Page) => page.getByRole("dialog", { name: /Tìm kiếm/ });
const openSearch = (page: Page) => page.getByRole("button", { name: /Tìm kiếm/ }).first();

test.describe("ô tìm kiếm", () => {
  test("mở bằng nút, gõ không dấu ra kết quả có dấu", async ({ page }) => {
    await gotoHydrated(page, "/");
    await openSearch(page).click();
    await expect(dialog(page)).toBeVisible();
    await page.getByLabel("Từ khóa tìm kiếm").fill("tuyen sinh");
    await expect(dialog(page).getByRole("option", { name: /Tuyển sinh/ }).first()).toBeVisible();
  });

  test("Ctrl+K mở và Esc đóng", async ({ page, isMobile }) => {
    test.skip(isMobile, "Không có bàn phím vật lý");
    await gotoHydrated(page, "/");
    // Nút bấm hydrate xong không có nghĩa bộ lắng nghe phím của hộp thoại đã gắn xong (nhất là khi máy bận).
    // Phím bấm lúc chưa có bộ lắng nghe thì mất hẳn, nên chỉ bấm lại khi hộp thoại chưa mở: không bao giờ bấm hai lần làm nó đóng.
    await expect(async () => {
      if (!(await dialog(page).isVisible())) await page.keyboard.press("Control+k");
      await expect(dialog(page)).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
  });

  test("Tab chạy vòng trong hộp thoại và đóng xong trả con trỏ về nút đã mở", async ({ page, isMobile }) => {
    test.skip(isMobile, "Kiểm tra bàn phím");
    await gotoHydrated(page, "/");
    const trigger = openSearch(page);
    await trigger.focus();
    await trigger.press("Enter");
    await expect(dialog(page)).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("chọn kết quả thì chuyển trang và lần sau có lịch sử tìm kiếm", async ({ page }) => {
    await gotoHydrated(page, "/");
    await openSearch(page).click();
    await page.getByLabel("Từ khóa tìm kiếm").fill("tuyen sinh");
    await dialog(page).getByRole("option", { name: /Tuyển sinh/ }).first().click();
    await expect(page).toHaveURL(/\/admissions/);
    await openSearch(page).click();
    await expect(dialog(page).getByText("Tìm gần đây")).toBeVisible();
    await expect(dialog(page).getByRole("button", { name: "tuyen sinh", exact: true })).toBeVisible();
  });

  test("không có kết quả thì còn lối tìm tiếp trong Tài liệu và Vật tư", async ({ page }) => {
    await gotoHydrated(page, "/");
    await openSearch(page).click();
    await page.getByLabel("Từ khóa tìm kiếm").fill("zzzkhongco");
    await expect(dialog(page).getByText(/Không có kết quả/)).toBeVisible();
    await expect(dialog(page).getByRole("link", { name: "Tài liệu" })).toHaveAttribute("href", /\/resources\/documents\?q=zzzkhongco/);
    await expect(dialog(page).getByRole("link", { name: "Vật tư" })).toHaveAttribute("href", /\/resources\/inventory\?q=zzzkhongco/);
  });
});
