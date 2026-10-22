import { describe, expect, it } from "vitest";
import { dedupeBy, safeHref, safeHttpUrl } from "@/lib/safe-url";
import { resolvePhotoUrl } from "@/lib/photo-url";

describe("safeHttpUrl", () => {
  it("nhận http(s) hợp lệ", () => {
    expect(safeHttpUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(safeHttpUrl("  http://example.com  ")).toBe("http://example.com/");
  });
  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:x",
    "//evil.com",
    "https://google.com@evil.com",
    "https://user:pass@example.com",
    "https://exa mple.com",
    "ftp://example.com",
    "",
    "   "
  ])("từ chối %j", (value) => expect(safeHttpUrl(value)).toBe(""));
  it("từ chối link quá dài", () => expect(safeHttpUrl(`https://example.com/${"a".repeat(3000)}`)).toBe(""));
  it("không lỗi khi gặp null/undefined", () => {
    expect(safeHttpUrl(undefined)).toBe("");
    expect(safeHttpUrl(null)).toBe("");
  });
});

describe("safeHref", () => {
  it("cho phép đường dẫn nội bộ và http(s), chặn kiểu nguy hiểm", () => {
    expect(safeHref("/saved")).toBe("/saved");
    expect(safeHref("https://example.com")).toBe("https://example.com/");
    expect(safeHref("//evil.com")).toBe("");
    expect(safeHref("/\\evil.com")).toBe("");
    expect(safeHref("javascript:alert(1)")).toBe("");
  });
});

describe("dedupeBy", () => {
  it("giữ phần tử đầu tiên và đếm số bị bỏ", () => {
    const { items, removed } = dedupeBy([{ k: "a", n: 1 }, { k: "b", n: 2 }, { k: "a", n: 3 }], (i) => i.k);
    expect(items.map((i) => i.n)).toEqual([1, 2]);
    expect(removed).toBe(1);
  });
});

describe("resolvePhotoUrl", () => {
  it("tên file trong thư mục ảnh được mã hóa từng đoạn", () => {
    expect(resolvePhotoUrl("a b#1.jpg", "campus")).toMatch(/^\/images\/[^/]+\/a%20b%231\.jpg$/);
  });
  it("giữ nguyên link https và đường dẫn nội bộ", () => {
    expect(resolvePhotoUrl("https://example.com/a.png", "campus")).toBe("https://example.com/a.png");
    expect(resolvePhotoUrl("/images/x.png", "campus")).toBe("/images/x.png");
  });
  it.each(["javascript:alert(1)", "data:image/svg+xml,<svg/>", "//evil.com/a.png", "../../etc/passwd", "a/../../b.png", "..\\x.png", "/../x.png"])("chặn %j", (value) => {
    expect(resolvePhotoUrl(value, "campus")).toBe("");
  });
  it("ảnh trống thì trả rỗng", () => expect(resolvePhotoUrl("  ", "campus")).toBe(""));
});
