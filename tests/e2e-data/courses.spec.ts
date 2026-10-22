import { expect, test, type Page } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

const openCourse = async (page: Page) => {
  await gotoHydrated(page, "/resources/courses");
  await page.locator("a.course-card").filter({ hasText: "Vi điều khiển" }).click();
  await expect(page.getByRole("heading", { name: "AVR", exact: true })).toBeVisible();
};

test.describe("Khóa học và tiến độ", () => {
  test("danh sách 3 khóa, chưa học bài nào thì không hiện tiến độ", async ({ page }) => {
    await gotoHydrated(page, "/resources/courses");
    await expect(page.locator("a.course-card")).toHaveCount(3);
    await expect(page.locator(".cp-summary")).toHaveCount(0);
    await expect(page.locator(".cp-card")).toHaveCount(0);
  });

  test("học dần: nút chính đổi theo tiến độ, thanh tiến độ và thẻ khóa học cập nhật", async ({ page }) => {
    await openCourse(page);
    await expect(page.getByText("Đã học 0/4")).toBeVisible();
    await expect(page.getByRole("link", { name: /^Bắt đầu học/ })).toBeVisible();
    await expect(page.getByText("Bài 05: ADC (sắp có)")).toBeVisible(); // bài chưa có link không tính vào tiến độ

    await page.getByLabel("Đã học: Bài 01: Chớp tắt LED").check();
    await expect(page.getByText("Đã học 1/4")).toBeVisible();
    await expect(page.getByRole("link", { name: /^Học tiếp: Bài 02: Nút nhấn và chống rung/ })).toBeVisible();

    // Danh sách khóa: thẻ có tiến độ, dải tổng kết và nút Học tiếp
    await gotoHydrated(page, "/resources/courses");
    await expect(page.locator("a.course-card").filter({ hasText: "Vi điều khiển" }).locator(".cp-card")).toContainText("1/7 bài");
    await expect(page.locator(".cp-summary")).toContainText("1/16 bài");
    await expect(page.locator(".cp-summary").getByRole("link", { name: /Học tiếp: Vi điều khiển/ })).toBeVisible();
  });

  test("đánh dấu cả nhánh rồi đặt lại; tiến độ giữ nguyên sau khi tải lại trang", async ({ page }) => {
    await openCourse(page);
    await page.getByRole("button", { name: "Đánh dấu cả nhánh đã học" }).click();
    await expect(page.getByText("Đã học 4/4")).toBeVisible();
    await expect(page.locator(".cp-congrats")).toContainText("4 bài");
    await expect(page.getByRole("link", { name: "Học lại từ đầu" })).toBeVisible();

    await page.reload();
    await expect(page.getByText("Đã học 4/4")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Đặt lại tiến độ" }).click();
    await expect(page.getByText("Đã học 0/4")).toBeVisible();
  });

  test("hai nhánh có tiến độ riêng", async ({ page }) => {
    await openCourse(page);
    await page.getByLabel("Đã học: Bài 01: Chớp tắt LED").check();
    await page.getByRole("link", { name: /ARM Cortex-M/ }).click();
    await expect(page.getByText("Đã học 0/3")).toBeVisible();
  });
});
