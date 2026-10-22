import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Quét khả năng truy cập tự động (axe-core, chuẩn WCAG 2.x A/AA). Chỉ bắt lỗi "serious" và "critical" để CI không gãy vì chi tiết nhỏ;
// kết quả đầy đủ xem trong báo cáo khi bài kiểm thử lỗi.
for (const path of ["/", "/events", "/resources/documents", "/resources/inventory", "/resources/courses", "/saved", "/changelog"]) {
  test(`${path} không có lỗi truy cập nghiêm trọng`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Quét ở một cỡ màn hình là đủ");
    // Tắt hiệu ứng hiện dần: axe đo màu lúc phần tử còn nửa trong suốt sẽ ra tương phản thấp giả.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} chỗ, ví dụ ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}
