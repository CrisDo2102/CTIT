import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// scroll-memory.ts đọc `window` ngay khi nạp module, nên dựng window giả rồi mới nạp.
const B = "/resources/inventory";
let mem: Map<string, string>;
let listeners: Record<string, () => void>;
let mod: typeof import("@/lib/scroll-memory");

beforeEach(async () => {
  mem = new Map();
  listeners = {};
  vi.stubGlobal("window", {
    sessionStorage: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, String(v)), removeItem: (k: string) => mem.delete(k) },
    addEventListener: (type: string, fn: () => void) => (listeners[type] = fn)
  });
  vi.resetModules();
  mod = await import("@/lib/scroll-memory");
});
afterEach(() => vi.unstubAllGlobals());

describe("scroll-memory", () => {
  it("vào trang mới (không phải quay lại) thì không cuộn, và xóa vị trí đã nhớ", () => {
    mod.saveScroll(B, "?q=esp", 1234);
    expect(mod.takeScroll(B, "?q=esp")).toBeNull();
    mod.markRestore(B);
    expect(mod.takeScroll(B, "?q=esp")).toBeNull();
  });

  it("bấm ← Danh sách: trả đúng vị trí, chỉ một lần", () => {
    mod.saveScroll(B, "?q=esp", 1234);
    mod.markRestore(B);
    expect(mod.takeScroll(B, "?q=esp")).toBe(1234);
    mod.markRestore(B);
    expect(mod.takeScroll(B, "?q=esp")).toBeNull();
  });

  it("khác bộ lọc thì không cuộn", () => {
    mod.saveScroll(B, "?q=esp", 900);
    mod.markRestore(B);
    expect(mod.takeScroll(B, "?q=stm")).toBeNull();
  });

  it("nút Back của trình duyệt (popstate) cũng trả vị trí", () => {
    mod.saveScroll(B, "", 500);
    listeners.popstate();
    expect(mod.takeScroll(B, "")).toBe(500);
  });

  it("cờ của danh sách khác không ảnh hưởng", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T00:00:00Z"));
    mod.saveScroll(B, "", 700);
    mod.markRestore("/resources/documents");
    expect(mod.takeScroll(B, "")).toBeNull();
    vi.useRealTimers();
  });

  it("quá 30 phút thì bỏ", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T00:00:00Z"));
    mod.saveScroll(B, "", 800);
    mod.markRestore(B);
    vi.setSystemTime(new Date("2026-10-13T00:31:00Z"));
    expect(mod.takeScroll(B, "")).toBeNull();
    vi.useRealTimers();
  });

  it("dữ liệu hỏng không gây lỗi", () => {
    mem.set(`ctit-scroll:${B}`, "{hỏng");
    mod.markRestore(B);
    expect(mod.takeScroll(B, "")).toBeNull();
  });

  it("trình duyệt chặn sessionStorage thì không lỗi", async () => {
    vi.stubGlobal("window", {
      get sessionStorage() {
        throw new Error("blocked");
      },
      addEventListener: () => {}
    });
    vi.resetModules();
    const blocked = await import("@/lib/scroll-memory");
    expect(() => blocked.saveScroll(B, "", 1)).not.toThrow();
    expect(blocked.takeScroll(B, "")).toBeNull();
  });
});
