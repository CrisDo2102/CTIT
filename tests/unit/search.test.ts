import { describe, expect, it } from "vitest";
import { searchEntries, type SearchEntry } from "@/lib/search";

const entries: SearchEntry[] = [
  { kind: "Trang", title: "Tuyển sinh", sub: "Các bước tham gia", href: "/admissions" },
  { kind: "Tài liệu", title: "Hướng dẫn STM32 cho người mới", sub: "Datasheet", href: "https://example.com/a", external: true },
  { kind: "Inventory", title: "STM32F103C8T6", sub: "ST · Kệ A2", href: "/resources/inventory/stm32f103" },
  { kind: "Khóa học", title: "Lập trình nhúng với ESP32", sub: "", href: "/resources/courses/esp32" },
  { kind: "Tin tức", title: "Tổng kết tuyển sinh 2026", sub: "", href: "/news" }
];

describe("searchEntries", () => {
  it("tìm không dấu ra kết quả có dấu", () => {
    const hits = searchEntries(entries, "tuyen sinh");
    expect(hits.map((h) => h.title)).toContain("Tuyển sinh");
    expect(hits.map((h) => h.title)).toContain("Tổng kết tuyển sinh 2026");
  });

  it("khớp nhiều từ: phải có đủ mọi từ", () => {
    expect(searchEntries(entries, "stm32 datasheet").map((h) => h.title)).toEqual(["Hướng dẫn STM32 cho người mới"]);
    expect(searchEntries(entries, "stm32 zzz")).toEqual([]);
  });

  it("tiêu đề bắt đầu bằng từ khóa xếp trên tiêu đề chỉ chứa từ khóa", () => {
    const hits = searchEntries(entries, "stm32");
    expect(hits[0].title).toBe("STM32F103C8T6");
  });

  it("từ khóa rỗng hoặc toàn khoảng trắng trả về rỗng", () => {
    expect(searchEntries(entries, "")).toEqual([]);
    expect(searchEntries(entries, "   ")).toEqual([]);
  });

  it("tôn trọng giới hạn số kết quả", () => {
    expect(searchEntries(entries, "s", 2)).toHaveLength(2);
  });

  it("gọi lại nhiều lần cho kết quả giống nhau (bộ nhớ đệm không làm sai lệch)", () => {
    const first = searchEntries(entries, "esp32");
    const second = searchEntries(entries, "esp32");
    expect(second).toEqual(first);
    expect(first[0].title).toBe("Lập trình nhúng với ESP32");
  });
});
