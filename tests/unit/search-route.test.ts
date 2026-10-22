import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// /api/search với dữ liệu mẫu: kiểm tra link mà ô tìm kiếm mở ra cho từng loại.
const env = JSON.parse(readFileSync("tests/fixtures/env.json", "utf8")) as Record<string, string>;
type Entry = { kind: string; title: string; href: string; external?: boolean };
let entries: Entry[];

beforeEach(async () => {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  vi.stubEnv("SHEET_FIXTURES_DIR", "tests/fixtures");
  vi.stubEnv("VERCEL", "");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("không gọi mạng")));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.resetModules();
  const { GET } = await import("@/app/api/search/route");
  entries = await (await GET()).json();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("GET /api/search", () => {
  it("vật tư mở thẳng trang chi tiết của đúng món (không phải danh sách lọc theo tên)", () => {
    const inventory = entries.filter((e) => e.kind === "Inventory");
    expect(inventory.length).toBeGreaterThan(20);
    expect(inventory.every((e) => /^\/resources\/inventory\/[a-z0-9-]+$/.test(e.href))).toBe(true);
    expect(inventory.find((e) => e.title === "ESP32 NodeMCU LuaNode32 (Type-C)")?.href).toBe("/resources/inventory/esp32-nodemcu-luanode32-type-c");
  });

  it("hai món cùng tên khác vị trí đều có mặt với link khác nhau", () => {
    const kim = entries.filter((e) => e.title === "Kìm cắt chân linh kiện");
    expect(kim).toHaveLength(2);
    expect(new Set(kim.map((e) => e.href)).size).toBe(2);
  });

  it("không có mục trùng hoàn toàn và không có link nguy hiểm", () => {
    const keys = entries.map((e) => `${e.kind}|${e.href}|${e.title}`.toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
    expect(entries.every((e) => /^\/|^https?:\/\//.test(e.href))).toBe(true);
  });

  it("các loại đều có mặt: trang, tài liệu, vật tư, khóa học, tin tức, sự kiện", () => {
    expect(new Set(entries.map((e) => e.kind))).toEqual(expect.objectContaining(new Set(["Trang", "Tài liệu", "Inventory", "Khóa học", "Tin tức", "Sự kiện"])));
  });
});
