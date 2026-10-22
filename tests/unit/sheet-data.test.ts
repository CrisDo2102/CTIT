import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Kiểm thử "từ đầu đến cuối" tầng dữ liệu: CSV giả như Google Sheet trả về -> getResources().
// Bảo vệ các việc đã làm: lọc link nguy hiểm, bỏ dòng trùng, cắt khoảng trắng.
const URL_OK = "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv";
const CSV = [
  "title,url,type,Mục lớn,description",
  '"Datasheet STM32",https://example.com/stm32.pdf,Datasheet,Vi điều khiển,"Tài liệu, có dấu phẩy"',
  '"Datasheet STM32",https://example.com/stm32.pdf,Datasheet,Vi điều khiển,Dòng trùng',
  '"Link xấu",javascript:alert(1),Link,Khác,',
  '"Link data","data:text/html,<script>alert(1)</script>",Link,Khác,',
  '"Không có link",,Link,Khác,',
  '"Bài viết","  https://example.com/b  ",Bài viết,Vi điều khiển,'
].join("\n");

beforeEach(() => {
  vi.stubEnv("RESOURCES_SHEET_CSV_URL", URL_OK);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(CSV, { status: 200 })));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getResources", () => {
  it("giữ dòng hợp lệ, bỏ dòng trùng, link nguy hiểm và dòng thiếu link", async () => {
    const { getResources } = await import("@/lib/sheet-data");
    const resources = await getResources();
    expect(resources.map((r) => r.title)).toEqual(["Datasheet STM32", "Bài viết"]);
  });

  it("mọi url đều là http(s) đã chuẩn hóa, không có khoảng trắng thừa", async () => {
    const { getResources } = await import("@/lib/sheet-data");
    const resources = await getResources();
    expect(resources.every((r) => /^https?:\/\//.test(r.url))).toBe(true);
    expect(resources[1].url).toBe("https://example.com/b");
  });

  it("đọc đúng ô có dấu phẩy trong ngoặc kép", async () => {
    const { getResources } = await import("@/lib/sheet-data");
    expect((await getResources())[0].description).toBe("Tài liệu, có dấu phẩy");
  });

  it("Sheet lỗi: trả danh sách rỗng chứ không ném lỗi", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    const { getResources } = await import("@/lib/sheet-data");
    await expect(getResources()).resolves.toEqual([]);
  });
});
