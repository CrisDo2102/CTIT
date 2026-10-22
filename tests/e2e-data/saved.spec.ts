import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../e2e/helpers";

const toast = (page: import("@playwright/test").Page) => page.locator(".toast");

test.describe("★ Lưu, thông báo, Hoàn tác và trang Đã lưu", () => {
  test("bấm ★ hiện thông báo, Hoàn tác trả lại như cũ", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    const star = page.getByRole("button", { name: /^Lưu lại: STM32F103C8T6 Blue Pill \(Micro USB\)/ });
    await star.click();
    await expect(toast(page)).toContainText("Đã lưu");
    await expect(page.getByRole("button", { name: /^Bỏ lưu: STM32F103C8T6 Blue Pill \(Micro USB\)/ })).toHaveAttribute("aria-pressed", "true");
    await toast(page).getByRole("button", { name: "Hoàn tác" }).click();
    await expect(page.getByRole("button", { name: /^Lưu lại: STM32F103C8T6 Blue Pill \(Micro USB\)/ })).toHaveAttribute("aria-pressed", "false");
  });

  test("thông báo dừng đếm giờ khi rê chuột hoặc focus vào, rời ra thì mới tự tắt", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    await page.clock.install();
    await page.getByRole("button", { name: /^Lưu lại: Raspberry Pi Pico/ }).click();
    await expect(toast(page)).toBeVisible();
    await toast(page).hover();
    await page.clock.fastForward(20_000); // rê chuột trên thông báo: 20 giây vẫn còn
    await expect(toast(page)).toBeVisible();
    await page.mouse.move(5, 5);
    await page.clock.fastForward(2_000);
    await expect(toast(page)).toBeVisible(); // rời ra: còn khoảng 3 giây
    await page.clock.fastForward(2_000);
    await expect(toast(page)).toHaveCount(0);
  });

  test("thông báo không biến mất sau 5 giây như trước (hiện đủ 8 giây khi không tương tác)", async ({ page }) => {
    await gotoHydrated(page, "/resources/inventory");
    await page.clock.install();
    await page.getByRole("button", { name: /^Lưu lại: Raspberry Pi Pico/ }).click();
    await page.clock.fastForward(6_000);
    await expect(toast(page)).toBeVisible();
    await page.clock.fastForward(2_500);
    await expect(toast(page)).toHaveCount(0);
  });

  test("lưu hai mục khác loại rồi quản lý trong /saved: nhóm, tìm, chọn nhiều, hoàn tác, sao chép", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await gotoHydrated(page, "/resources/inventory");
    await page.getByRole("button", { name: /^Lưu lại: ESP32 NodeMCU LuaNode32/ }).click();
    await gotoHydrated(page, "/resources/documents");
    await page.getByRole("button", { name: /^Lưu lại: Giới thiệu mạng CAN trong ô tô/ }).first().click();

    await gotoHydrated(page, "/saved");
    await expect(page.locator(".saved-head")).toContainText("2 mục đã lưu");
    await expect(page.locator(".saved-group h2")).toHaveCount(2); // hai nhóm: Vật tư và Tài liệu

    await page.getByLabel("Tìm trong mục đã lưu").fill("CAN");
    await expect(page.locator(".saved-group li")).toHaveCount(1);
    await page.getByLabel("Tìm trong mục đã lưu").fill("");

    // Chọn nhiều -> bỏ lưu hết -> Hoàn tác
    await page.getByRole("button", { name: "Chọn nhiều" }).click();
    await page.getByRole("button", { name: "Chọn tất cả" }).click();
    await page.getByRole("button", { name: /^Bỏ lưu \(2\)/ }).click();
    await expect(page.locator(".empty-state")).toContainText("Chưa lưu mục nào");
    await page.locator(".saved-undo").getByRole("button", { name: "Hoàn tác" }).click();
    await expect(page.locator(".saved-head")).toContainText("2 mục đã lưu");
  });

  test("danh sách đã lưu sống sót khi tải lại trang và hiện số lượng (dải trên cùng ở máy tính, menu ở điện thoại)", async ({ page, isMobile }) => {
    await gotoHydrated(page, "/resources/inventory");
    await page.getByRole("button", { name: /^Lưu lại: Raspberry Pi Pico/ }).click();
    await page.reload();
    if (isMobile) {
      await page.getByRole("button", { name: "Mở menu" }).click();
      await expect(page.getByRole("navigation", { name: "Menu chính" }).getByRole("link", { name: "★ Đã lưu (1)" })).toBeVisible();
    } else {
      await expect(page.locator(".top-links").getByText(/★ Đã lưu \(1\)/)).toBeVisible();
    }
  });

  test("dữ liệu lưu bị hỏng trong localStorage không làm trang lỗi", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("ctit-saved", JSON.stringify([{ id: "x", title: "Tốt", href: "/ok", kind: "Khác" }, { id: "y", title: "Link độc", href: "javascript:alert(1)", kind: "Khác" }, "rác", null, { id: "z" }]));
    });
    await gotoHydrated(page, "/saved");
    await expect(page.locator(".saved-group li")).toHaveCount(1); // chỉ còn mục hợp lệ
    expect(await page.locator('a[href^="javascript:"]').count()).toBe(0);
  });
});
