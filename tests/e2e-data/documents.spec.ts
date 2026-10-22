import { expect, test, type Page } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

const facet = (page: Page, title: string) => page.locator("details.inv-facet").filter({ has: page.locator("summary", { hasText: title }) });
const total = (page: Page) => page.locator(".result-line [role=status] strong").first();

test.describe("Tài liệu với dữ liệu", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/resources/documents");
  });

  test("24 tài liệu, 3 mục nổi bật; bỏ dòng trùng, link độc và dòng thiếu link", async ({ page }) => {
    await expect(total(page)).toHaveText("24");
    await expect(page.locator(".resource-spotlight article")).toHaveCount(3);
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("PHẢI BỊ LOẠI");
    await expect(page.getByRole("heading", { name: "Hướng dẫn STM32 cho người mới bắt đầu" })).toHaveCount(2 - 1 + 1); // 1 ở "Nổi bật" + 1 trong danh sách, dòng trùng đã gộp
  });

  test("tiêu đề rất dài không làm vỡ bố cục thẻ", async ({ page }) => {
    const long = page.locator("article.resource-card").filter({ hasText: "Tài liệu có tiêu đề rất dài" });
    const box = await long.boundingBox();
    const sibling = await page.locator("article.resource-card").nth(1).boundingBox();
    expect(box!.width).toBeLessThan(sibling!.width * 1.2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("lọc nhiều lựa chọn: cùng nhóm là HOẶC, khác nhóm là VÀ", async ({ page, isMobile }) => {
    test.skip(isMobile, "Bộ lọc nằm trong ngăn kéo ở điện thoại");
    await facet(page, "Lĩnh vực").getByLabel(/^Ô tô/).check();
    const oto = Number(await total(page).innerText());
    await facet(page, "Lĩnh vực").getByLabel(/^Giao thông thông minh/).check();
    const hoac = Number(await total(page).innerText());
    expect(hoac).toBeGreaterThan(oto); // thêm một ô cùng nhóm: nhiều kết quả hơn
    await facet(page, "Loại").getByLabel(/^PDF|^Pdf|^pdf/i).first().check();
    const va = Number(await total(page).innerText());
    expect(va).toBeLessThan(hoac); // thêm một ô khác nhóm: ít kết quả hơn
    await expect(page).toHaveURL(/cat=.*cat=.*type=/);
  });

  test("công tắc 'Chỉ hiện mục đã lưu' và trạng thái trống có lối thoát", async ({ page, isMobile }) => {
    test.skip(isMobile, "Dùng link trực tiếp ở điện thoại");
    await page.goto("/resources/documents?saved=1");
    await expect(page.locator(".empty-state")).toContainText("chưa lưu tài liệu nào");
    await page.getByRole("button", { name: "Xem tất cả tài liệu" }).click();
    await expect(total(page)).toHaveText("24");
  });

  test("sắp xếp A → Z", async ({ page }) => {
    await page.getByLabel("Sắp xếp tài liệu").selectOption("az");
    const titles = await page.locator(".inv-results .grid.three article.resource-card h3").allInnerTexts();
    const sorted = [...titles].sort((a, b) => a.localeCompare(b, "vi"));
    expect(titles.slice(0, 5)).toEqual(sorted.slice(0, 5));
    await expect(page).toHaveURL(/sort=az/);
  });
});
