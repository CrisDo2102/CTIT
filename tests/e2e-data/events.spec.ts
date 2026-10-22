import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

test.describe("Sự kiện: thêm vào lịch và lịch tháng", () => {
  test("danh sách có sự kiện sắp tới, đã qua và có nút thêm vào lịch ở sự kiện chưa diễn ra", async ({ page }) => {
    await gotoHydrated(page, "/events");
    await expect(page.getByRole("heading", { name: "Workshop CAN bus trên ATmega" }).first()).toBeVisible();
    await expect(page.getByText("Thêm vào lịch").first()).toBeVisible();
    await expect(page.getByText("Chương trình chưa chốt lịch")).toBeVisible(); // không có ngày vẫn hiện ở chế độ Danh sách
  });

  test("link Google Calendar đúng giờ (18:00 giờ Việt Nam = 11:00 UTC)", async ({ page }) => {
    await gotoHydrated(page, "/events");
    const href = await page.getByRole("link", { name: /^Google/ }).first().getAttribute("href");
    expect(href).toContain("https://calendar.google.com/calendar/render?");
    expect(href).toContain("text=Workshop%20CAN%20bus");
    expect(href).toMatch(/dates=\d{8}T110000Z\/\d{8}T130000Z/);
  });

  test("tải file .ics hợp lệ", async ({ page }) => {
    await gotoHydrated(page, "/events");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Apple / Outlook (.ics)" }).first().click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^ctit-\d{4}-\d{2}-\d{2}\.ics$/);
    const text = readFileSync((await file.path())!, "utf8");
    expect(text).toContain("BEGIN:VCALENDAR");
    expect(text).toContain("SUMMARY:Workshop CAN bus trên ATmega");
    expect(text).toMatch(/DTSTART:\d{8}T110000Z/);
    expect(text).toContain("END:VCALENDAR");
    expect(text.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });

  test("lịch tháng: hôm nay được đánh dấu, bấm ngày có sự kiện xem chi tiết, đổi tháng, tôn trọng bộ lọc nhãn", async ({ page }) => {
    await gotoHydrated(page, "/events");
    await page.getByRole("tab", { name: "Lịch tháng" }).click();
    await expect(page.locator(".evc-head h2")).toContainText(/Tháng \d+\/\d{4}/);
    await expect(page.locator(".evc-cell.is-today")).toHaveCount(1);
    await expect(page.locator(".evc-cell.is-today")).toHaveAttribute("aria-label", /hôm nay/);

    const withEvents = page.locator("button.evc-cell.has-events:not(.is-past)").first();
    await withEvents.click();
    await expect(page.locator(".evc-panel-head h3")).toContainText(/^Ngày /);
    await page.getByRole("button", { name: "Xem cả tháng" }).click();

    const before = await page.locator(".evc-head h2").innerText();
    await page.getByRole("button", { name: "Tháng sau" }).click();
    expect(await page.locator(".evc-head h2").innerText()).not.toBe(before);
    await page.getByRole("button", { name: "Hôm nay" }).click();
    expect(await page.locator(".evc-head h2").innerText()).toBe(before);

    // Lọc nhãn "Cuộc thi" (1 sự kiện): trong mọi tháng đã xem chỉ còn tối đa 1 sự kiện
    await page.getByRole("tab", { name: /Cuộc thi/ }).or(page.getByRole("button", { name: /Cuộc thi/ })).first().click();
    const text = await page.locator(".evc-count").innerText();
    expect(Number(text.match(/\d+/)![0])).toBeLessThanOrEqual(1);
  });

  test("sự kiện sắp tới ở trang chủ dạng thẻ ngày, không có sự kiện đã qua", async ({ page }) => {
    await gotoHydrated(page, "/");
    const cards = page.locator(".up-card");
    await expect(cards).toHaveCount(3);
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
    for (const date of await page.locator(".up-card time").evaluateAll((els) => els.map((el) => el.getAttribute("datetime")))) {
      expect(date! >= today, `${date} phải từ hôm nay (${today}) trở đi`).toBe(true);
    }
  });
});
