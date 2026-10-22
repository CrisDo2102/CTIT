import { expect, test, type Page } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

const card = (page: Page, title: string) => page.locator("article.inventory-card").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
const facet = (page: Page, title: string) => page.locator("details.inv-facet").filter({ has: page.locator("summary", { hasText: title }) });
const count = (page: Page) => page.locator(".inventory-result-line [role=status] strong").first();

test.describe("Inventory với dữ liệu", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
  });

  test("hiện 26 món, loại dòng trùng và dòng thiếu id, giữ hai món cùng tên", async ({ page }) => {
    await expect(count(page)).toHaveText("26");
    await expect(page.locator("article.inventory-card")).toHaveCount(26);
    await expect(page.getByRole("heading", { name: "FT232RL USB-UART (Type-C)", exact: true })).toHaveCount(1); // dòng trùng đã gộp
    await expect(page.getByRole("heading", { name: "Kìm cắt chân linh kiện", exact: true })).toHaveCount(2);
    expect(await page.locator("body").innerText()).not.toContain("PHẢI BỊ LOẠI");
  });

  test('"Sắp hết" không bị hiện nhầm thành "Hết hàng"; bộ lọc Trạng thái không có hai nhãn trùng nhau', async ({ page }) => {
    await expect(card(page, "STM32F103CBT6 Blue Pill").locator(".inventory-status")).toHaveText("Sắp hết");
    await expect(card(page, "ESP32-S3 DevKitC-1").locator(".inventory-status")).toHaveText("Hết hàng");
    const labels = (await facet(page, "Trạng thái").locator(".inv-opt span").allTextContents()).map((label) => label.trim()); // textContent: ngăn kéo ở điện thoại đang ẩn
    expect(labels.length).toBeGreaterThan(1);
    expect(new Set(labels).size, `nhãn trùng: ${labels.join(" | ")}`).toBe(labels.length);
  });

  test("ô thống kê khớp dữ liệu: có sẵn 17, sắp hết 3, tổng mặt hàng 26", async ({ page }) => {
    const kpi = (label: string) => page.locator(".inventory-kpi").filter({ hasText: label }).locator("strong");
    await expect(kpi("Tổng mặt hàng")).toHaveText("26");
    await expect(kpi("Đang có sẵn")).toHaveText("17");
    await expect(kpi("Sắp hết")).toHaveText("3");
  });

  test("tick bộ lọc: kết quả, chip, số đếm các nhóm khác và link đều cập nhật", async ({ page, isMobile }) => {
    test.skip(isMobile, "Bộ lọc nằm trong ngăn kéo ở điện thoại, xem bài riêng");
    await facet(page, "Danh mục").getByLabel(/Dụng cụ/).check();
    await expect(count(page)).toHaveText("5");
    await expect(page.locator(".inv-active")).toContainText("Dụng cụ");
    await expect(page).toHaveURL(/cat=D%E1%BB%A5ng\+c%E1%BB%A5/);
    // Trong "Dụng cụ" chỉ còn các hãng của dụng cụ: hãng khác (đếm 0) bị khóa, hãng có món (Proskit 3) vẫn chọn được
    await expect(facet(page, "Hãng").getByLabel(/Proskit/)).toBeEnabled();
    await expect(facet(page, "Hãng").locator(".inv-opt").filter({ has: page.getByLabel(/Proskit/) }).locator("b")).toHaveText("3");
    const locked = facet(page, "Hãng").locator(".inv-opt.is-empty");
    expect(await locked.count()).toBeGreaterThan(0);
    await expect(locked.first().locator("b")).toHaveText("0");
    await expect(locked.first().locator("input")).toBeDisabled();
  });

  test("lọc ra rỗng thì gợi ý bỏ từng bộ lọc kèm số kết quả, bấm vào là có lại kết quả", async ({ page, isMobile }) => {
    test.skip(isMobile, "Xem bài ngăn kéo cho điện thoại");
    await page.goto("/resources/inventory?cat=C%E1%BA%A3m+bi%E1%BA%BFn&mk=Proskit"); // đi thẳng bằng link
    await expect(page.locator(".empty-state")).toContainText("Chưa có mặt hàng phù hợp");
    const bo = page.locator(".empty-suggest button");
    await expect(bo.filter({ hasText: "Hãng: Proskit" })).toContainText("4 kết quả");
    await expect(bo.filter({ hasText: "Danh mục: Cảm biến" })).toContainText("3 kết quả");
    await bo.filter({ hasText: "Hãng: Proskit" }).click();
    await expect(count(page)).toHaveText("4");
  });

  test("tìm kiếm theo từ khóa và giữ trong link", async ({ page }) => {
    await page.getByLabel("Tìm vật tư").fill("esp32");
    await expect(page).toHaveURL(/q=esp32/);
    const n = await count(page).innerText();
    expect(Number(n)).toBeGreaterThanOrEqual(3);
    expect(Number(n)).toBeLessThan(26);
  });

  test("mở link có sẵn bộ lọc thì đọc đúng bộ lọc", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory?st=H%E1%BA%BFt+h%C3%A0ng&stock=0");
    await expect(count(page)).toHaveText("2");
  });
});

test.describe("Inventory trên điện thoại", () => {
  test.beforeEach(async ({ isMobile }) => {
    test.skip(!isMobile, "Chỉ chạy trên cỡ điện thoại");
  });

  test("4 ô thống kê xếp 2x2, không chiếm nửa màn hình", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    const boxes = await page.locator(".inventory-kpi").evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(boxes[0].top).toBeCloseTo(boxes[1].top, 0); // hai ô đầu cùng hàng
    expect(boxes[2].top).toBeCloseTo(boxes[3].top, 0);
    expect(boxes[2].top).toBeGreaterThan(boxes[0].top);
    const total = boxes[3].bottom - boxes[0].top;
    expect(total).toBeLessThan(260);
  });

  test("ngăn kéo bộ lọc: nút Xem N kết quả, đóng bằng Esc và bằng nền mờ, khóa cuộn trang", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    const open = page.getByRole("button", { name: /^Bộ lọc/ }).first();
    await open.click();
    const drawer = page.locator("#inv-facets");
    await expect(drawer).toHaveClass(/is-open/);
    await expect(drawer.getByRole("button", { name: "Xem 26 kết quả" })).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await drawer.getByLabel(/Dụng cụ/).check();
    await expect(drawer.getByRole("button", { name: "Xem 5 kết quả" })).toBeVisible(); // nút cập nhật theo bộ lọc
    await page.keyboard.press("Escape");
    await expect(drawer).not.toHaveClass(/is-open/);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");

    await open.click();
    await expect(drawer).toHaveClass(/is-open/);
    await page.locator(".inv-backdrop").click({ position: { x: 10, y: 10 } });
    await expect(drawer).not.toHaveClass(/is-open/);
  });

  test("thanh Bộ lọc dính dưới header khi cuộn xuống danh sách dài", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    await page.evaluate(() => window.scrollTo(0, 3000));
    const bar = page.locator(".inv-results > .inventory-result-line");
    await expect(bar).toBeInViewport();
    const top = await bar.evaluate((el) => el.getBoundingClientRect().top);
    const header = await page.evaluate(() => document.querySelector(".header")!.getBoundingClientRect().height);
    expect(Math.abs(top - header)).toBeLessThan(4);
  });
});
