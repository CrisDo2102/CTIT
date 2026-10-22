import { expect, test, type Page } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

const dialog = (page: Page) => page.getByRole("dialog", { name: /Tìm kiếm/ });

test.describe("Trang chủ: các ô Khám phá CTIT", () => {
  test("7 ô có ảnh (trừ Trường & Khoa chỉ hiện số), Giới thiệu dùng logo, mọi ảnh tải được", async ({ page }) => {
    await gotoHydrated(page, "/");
    await page.waitForTimeout(800);
    const tiles = page.locator("a.ti-tile");
    await expect(tiles).toHaveCount(8);
    await expect(tiles.nth(2).locator(".ti-tile-media b")).toHaveText("03"); // Trường & Khoa: không ảnh
    expect(await tiles.nth(2).locator("img").count()).toBe(0);
    for (const i of [0, 1, 3, 4, 5, 6, 7]) expect(await tiles.nth(i).locator("img.ti-slide-img").count(), `ô ${i + 1}`).toBeGreaterThan(0);
    await expect(tiles.nth(0).locator("img.ti-slide-img")).toHaveAttribute("src", /logo/);
    const broken = await page.locator("img.ti-slide-img").evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src));
    expect(broken).toEqual([]);
  });

  test("ô Tuyển sinh tự đổi sang ảnh khác sau vài giây", async ({ page }) => {
    await gotoHydrated(page, "/");
    const img = page.locator("a.ti-tile").nth(1).locator("img.ti-slide-img").last();
    const first = await img.getAttribute("src");
    await expect.poll(async () => page.locator("a.ti-tile").nth(1).locator("img.ti-slide-img").last().getAttribute("src"), { timeout: 12_000 }).not.toBe(first);
  });

  test("bật 'giảm chuyển động' thì ảnh không tự đổi", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", baseURL });
    const page = await context.newPage();
    await gotoHydrated(page, "/");
    const first = await page.locator("a.ti-tile").nth(1).locator("img.ti-slide-img").last().getAttribute("src");
    await page.waitForTimeout(7000);
    expect(await page.locator("a.ti-tile").nth(1).locator("img.ti-slide-img").last().getAttribute("src")).toBe(first);
    await context.close();
  });
});

test.describe("Tìm kiếm với dữ liệu", () => {
  test("tìm ESP32: có kết quả Inventory và Tài liệu, chip lọc theo loại kèm số, chọn kết quả mở trang chi tiết", async ({ page }) => {
    await gotoHydrated(page, "/");
    await page.getByRole("button", { name: /Tìm kiếm/ }).first().click();
    await page.getByLabel("Từ khóa tìm kiếm").fill("esp32");
    await expect(dialog(page).getByRole("option", { name: /ESP32 NodeMCU LuaNode32/ })).toBeVisible();
    await expect(dialog(page).getByRole("option", { name: /ESP32 Getting Started/ })).toBeVisible();

    const chip = dialog(page).getByRole("tab", { name: /^Inventory/ });
    await expect(chip).toContainText(/\d/);
    await chip.click();
    const kinds = await dialog(page).locator(".search-group > p").allTextContents(); // CSS in hoa nên so sánh không phân biệt hoa thường
    expect(kinds.map((kind) => kind.trim().toLowerCase())).toEqual(["inventory"]);

    await dialog(page).getByRole("option", { name: /ESP32 NodeMCU LuaNode32/ }).click();
    await expect(page).toHaveURL(/\/resources\/inventory\/esp32-nodemcu/);
  });

  test("tìm không dấu ra tiếng Việt có dấu trong dữ liệu thật", async ({ page }) => {
    await gotoHydrated(page, "/");
    await page.getByRole("button", { name: /Tìm kiếm/ }).first().click();
    await page.getByLabel("Từ khóa tìm kiếm").fill("mang can");
    await expect(dialog(page).getByRole("option", { name: /Giới thiệu mạng CAN trong ô tô/ })).toBeVisible();
  });
});
