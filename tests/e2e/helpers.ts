import type { Page } from "@playwright/test";

/**
 * Mở trang và đợi React gắn xong (hydrate) để bấm phím / bấm nút / gõ chữ không bị "nuốt".
 * Chờ cho tới khi MỌI nút, ô nhập, ô chọn ở header và phần chính đều đã được React gắn (có __reactProps).
 * Bấm Ctrl+K ngay lúc trang vừa hiện thì bộ lắng nghe phím của ô tìm kiếm có thể chưa được gắn; gõ vào ô lọc chưa hydrate
 * thì chữ bị ghi đè khi React gắn xong.
 */
export async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => {
    const trigger = document.querySelector(".search-trigger");
    if (!trigger || !Object.keys(trigger).some((key) => key.startsWith("__reactProps"))) return false;
    const controls = [...document.querySelectorAll("header button, main button, main input, main select")];
    return controls.every((el) => Object.keys(el).some((key) => key.startsWith("__reactProps")));
  });
}
