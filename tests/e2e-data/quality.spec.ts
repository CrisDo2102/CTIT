import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

const PAGES = ["/", "/about", "/admissions", "/schools", "/research", "/news", "/events", "/resources", "/resources/documents", "/resources/inventory", "/resources/courses", "/campus", "/saved"];

test.describe("chất lượng trên mọi trang có dữ liệu", () => {
  for (const path of PAGES) {
    test(`${path}: không tràn ngang, không có link nguy hiểm, không lỗi JavaScript`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await gotoHydrated(page, path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "tràn ngang").toBeLessThanOrEqual(0);
      const bad = await page.locator('a[href^="javascript:" i], a[href^="data:" i], a[href^="vbscript:" i], img[src^="javascript:" i]').count();
      expect(bad, "link nguy hiểm").toBe(0);
      expect(errors).toEqual([]);
    });
  }

  test("tin có link độc vẫn hiện nhưng không có link bấm được", async ({ page }) => {
    await gotoHydrated(page, "/news");
    await expect(page.getByText(/Tin có link độc/).first()).toBeVisible();
    expect(await page.locator('a[href*="alert(1)"]').count()).toBe(0);
  });

  for (const path of PAGES) {
    test(`${path}: không có lỗi truy cập nghiêm trọng (axe)`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "data-desktop", "Quét ở một cỡ màn hình là đủ");
      await page.emulateMedia({ reducedMotion: "reduce" });
      await gotoHydrated(page, path);
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} chỗ, vd ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
    });
  }
});
