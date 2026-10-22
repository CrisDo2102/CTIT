import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

// Trang chủ điện ảnh: hero toàn màn hình, header nổi, mỗi hướng hoạt động một màn hình.
test.describe("trang chủ điện ảnh", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoHydrated(page, "/");
  });

  test("hero chiếm trọn chiều cao màn hình và tải ảnh đầu tiên ưu tiên", async ({ page }) => {
    const { hero, vh } = await page.evaluate(() => ({ hero: document.querySelector(".ti-hero")!.getBoundingClientRect().height, vh: window.innerHeight }));
    expect(hero).toBeGreaterThanOrEqual(Math.min(vh, 1100) * 0.98);
    const first = page.locator(".ti-slide-bg").first();
    await expect(first).toHaveAttribute("fetchpriority", "high");
    await expect(first).toHaveAttribute("loading", "eager");
  });

  test("header nổi: trong suốt ở đầu trang, nền kính mờ khi cuộn, trở lại khi lên đầu", async ({ page }) => {
    const header = page.locator("header.header");
    const bg = () => header.evaluate((el) => getComputedStyle(el).backgroundColor);
    await expect(header).toHaveClass(/is-overlay/);
    await expect(header).not.toHaveClass(/is-scrolled/);
    expect(await bg()).toBe("rgba(0, 0, 0, 0)");
    const linkColor = () => page.locator("header .brand").evaluate((el) => getComputedStyle(el).color);
    expect(await linkColor()).toBe("rgb(255, 255, 255)"); // chữ trắng trên ảnh

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(header).toHaveClass(/is-scrolled/);
    expect(await bg()).not.toBe("rgba(0, 0, 0, 0)");
    expect(await linkColor()).not.toBe("rgb(255, 255, 255)"); // chữ tối trên nền sáng
    expect(await header.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/is-scrolled/);
  });

  test("logo ở header có kích thước khai báo (không làm bố cục nhảy khi ảnh tải xong)", async ({ page }) => {
    const logo = page.locator("img.brand-logo");
    await expect(logo).toHaveAttribute("width", "42");
    await expect(logo).toHaveAttribute("height", "42");
  });

  test("ba hướng hoạt động, mỗi hướng một màn hình có đủ tiêu đề và hai nút", async ({ page }) => {
    const panels = page.locator(".ct-panel");
    await expect(panels).toHaveCount(3);
    await expect(panels.locator("h2")).toHaveText(["Điện tử ô tô", "Hệ thống nhúng", "Phương tiện và giao thông thông minh"]);
    for (let i = 0; i < 3; i++) {
      const links = panels.nth(i).locator(".ct-actions a");
      await expect(links).toHaveCount(2);
      await expect(links.nth(1)).toHaveAttribute("href", "/resources/documents");
    }
  });

  test("chữ và ảnh của từng hướng không dính sát mép màn hình (lỗi từng gặp: đè mất khung .container)", async ({ page }) => {
    for (const panel of await page.locator(".ct-panel").all()) {
      await panel.scrollIntoViewIfNeeded();
      const { copy, media, vw } = await panel.evaluate((el) => ({
        copy: el.querySelector(".ct-panel-copy")!.getBoundingClientRect().toJSON(),
        media: el.querySelector(".ct-panel-media")!.getBoundingClientRect().toJSON(),
        vw: window.innerWidth
      }));
      expect(copy.left).toBeGreaterThanOrEqual(16);
      expect(media.left).toBeGreaterThanOrEqual(16);
      expect(media.right).toBeLessThanOrEqual(vw - 16);
    }
    const hero = await page.locator(".ti-slide-copy").first().evaluate((el) => el.getBoundingClientRect().toJSON());
    expect(hero.left).toBeGreaterThanOrEqual(16);
  });

  test('nút "Khám phá" cuộn tới các hướng hoạt động, tiêu đề không bị header che', async ({ page }) => {
    const explore = page.locator(".ti-actions a.is-ghost").first();
    await expect(explore).toHaveAttribute("href", "#huong");
    await explore.click();
    await expect(page).toHaveURL(/#huong$/);
    await expect.poll(() => page.evaluate(() => Math.abs(document.querySelector("#huong")!.getBoundingClientRect().top)), { timeout: 5000 }).toBeLessThan(120);
    const h2 = await page.locator(".ct-panel h2").first().evaluate((el) => el.getBoundingClientRect().top);
    const headerBottom = await page.locator("header.header").evaluate((el) => el.getBoundingClientRect().bottom);
    expect(h2).toBeGreaterThan(headerBottom);
  });

  test("các trang khác vẫn dùng header trắng dính như cũ (không bị nổi)", async ({ page }) => {
    for (const path of ["/events", "/resources/inventory", "/about"]) {
      await gotoHydrated(page, path);
      await expect(page.locator("header.header.is-overlay"), path).toHaveCount(0);
      expect(await page.locator("header.header").evaluate((el) => getComputedStyle(el).position), path).toBe("sticky");
    }
  });

  test("toàn bộ trang chủ không tràn ngang và mọi ảnh trong các hướng hoạt động tải được", async ({ page }) => {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    const broken = await page.locator(".ct-panel-media img").evaluateAll((imgs) => (imgs as HTMLImageElement[]).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);
  });
});
