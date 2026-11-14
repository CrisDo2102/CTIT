import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

/**
 * Regression: pills navigation at top:12px/z-index:30 covered CTIT header.
 * Test cả chiều rộng 390px/1440px trên dữ liệu fixtures, không cần Google Sheet thật.
 */
const PILL_PAGES = [
  { url: "/admissions", sticky: ".adm-nav-wrap", section: "#adm-tracks" },
  { url: "/news", sticky: ".nw-nav-wrap", section: "#nw-headlines" }
];

for (const width of [390, 1440]) {
  for (const { url, sticky, section } of PILL_PAGES) {
    test(`${url} at ${width}px: pill stays below header; anchor isn't covered`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await gotoHydrated(page, url);
      const pill = page.locator(sticky);
      await expect(pill).toBeVisible();
      await expect.poll(() => page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--subnav-h")))).toBeGreaterThan(0);
      await pill.locator(`a[href="${section}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${section}$`));
      // Smooth scrolling is animated and may be disabled by OS preference.
      await expect.poll(async () => page.evaluate(({ sticky, section }) => {
        const h = document.querySelector(".header")!.getBoundingClientRect();
        const p = document.querySelector(sticky)!.getBoundingClientRect();
        const s = document.querySelector(section)!.getBoundingClientRect();
        return p.top >= h.bottom - 2 && s.top >= p.bottom - 2;
      }, { sticky, section }), { timeout: 8_000 }).toBe(true);
    });
  }

  test(`/research at ${width}px: sticky filter doesn't cover the header`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await gotoHydrated(page, "/research");
    const nav = page.locator(".rx-tabs-wrap");
    await expect(nav).toBeVisible();
    await page.locator('a[href="#rx-projects"]').first().click();
    await expect.poll(async () => page.evaluate(() => {
      const h = document.querySelector(".header")!.getBoundingClientRect();
      const n = document.querySelector(".rx-tabs-wrap")!.getBoundingClientRect();
      return n.top >= h.bottom - 2;
    }), { timeout: 8_000 }).toBe(true);
  });
}

test("sticky month and inventory filters use measured header height", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 860 });
  for (const { url, selector } of [
    { url: "/campus", selector: ".cp-month-head" },
    { url: "/events", selector: ".ev-month-label" },
    { url: "/resources/inventory", selector: ".inv-facets" }
  ]) {
    await gotoHydrated(page, url);
    const sticky = page.locator(selector).first();
    await expect(sticky).toBeVisible();
    await sticky.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 180));
    const result = await sticky.evaluate((node) => {
      const top = node.getBoundingClientRect().top;
      const headerBottom = document.querySelector(".header")!.getBoundingClientRect().bottom;
      return { top, headerBottom };
    });
    expect(result.top, `${url} sticky shouldn't overlap the header`).toBeGreaterThanOrEqual(result.headerBottom - 2);
  }
});

test("tables keep their own sticky top in the scrollable panel", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 850 });
  await gotoHydrated(page, "/resources/inventory");
  // A table's thead is sticky relative to its own scroll container, not the page header.
  const button = page.getByRole("button", { name: /bảng/i }).first();
  if (await button.count()) {
    await button.click();
    const top = await page.locator(".inventory-table thead th").first().evaluate((node) => getComputedStyle(node).top);
    expect(top).toBe("0px");
  }
});
