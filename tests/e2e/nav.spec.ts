import { expect, test } from "@playwright/test";

// Lỗi từng gặp: đang ở một mục và rê chuột sang mục kề bên thì hai gạch chân nối liền nhau.
test.describe("menu chính (máy tính)", () => {
  test.skip(({ isMobile }) => isMobile, "Menu ngang chỉ có ở màn hình rộng");

  test("gạch chân của hai mục kề nhau luôn có khe hở", async ({ page }) => {
    await page.goto("/events"); // "Sự kiện" là mục đang mở
    await page.locator(".nav-dropdown-trigger").hover();
    await page.waitForTimeout(400); // đợi hiệu ứng gạch chân (160ms)

    const geometry = await page.evaluate(() => {
      const underline = (el: Element) => {
        const rect = el.getBoundingClientRect();
        const after = getComputedStyle(el, "::after");
        return { left: rect.left + parseFloat(after.left), right: rect.right - parseFloat(after.right), scale: after.transform, border: getComputedStyle(el).borderBottomWidth };
      };
      const items = [...document.querySelectorAll(".mainnav > a, .nav-dropdown-trigger")];
      const events = items.find((el) => el.textContent?.trim() === "Sự kiện")!;
      const resources = items.find((el) => el.textContent?.includes("Tài nguyên"))!;
      return { events: underline(events), resources: underline(resources) };
    });

    expect(geometry.events.border).toBe("0px");
    expect(geometry.resources.border).toBe("0px");
    expect(geometry.resources.left - geometry.events.right).toBeGreaterThanOrEqual(8);
  });

  test("menu không tràn khỏi khung header ở cỡ hẹp nhất còn hiện menu ngang", async ({ page }) => {
    await page.setViewportSize({ width: 1021, height: 700 });
    await page.goto("/");
    const { navRight, headerRight, scrollWidth } = await page.evaluate(() => ({
      navRight: document.querySelector(".mainnav")!.getBoundingClientRect().right,
      headerRight: document.querySelector(".header-inner")!.getBoundingClientRect().right,
      scrollWidth: document.documentElement.scrollWidth
    }));
    expect(navRight).toBeLessThanOrEqual(headerRight + 1);
    expect(scrollWidth).toBeLessThanOrEqual(1021);
  });
});
