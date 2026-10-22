import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Dữ liệu mẫu (tests/fixtures) chạy qua đúng các hàm đọc dữ liệu thật của site, không có mạng.
// Vừa kiểm tra bộ dữ liệu mẫu, vừa là bài kiểm thử đầu-cuối cho tầng dữ liệu: dòng trùng, link độc, dòng thiếu cột bắt buộc.
const env = JSON.parse(readFileSync("tests/fixtures/env.json", "utf8")) as Record<string, string>;

type Sheet = typeof import("@/lib/sheet-data");
let sheet: Sheet;

beforeEach(async () => {
  for (const [name, value] of Object.entries(env)) vi.stubEnv(name, value);
  vi.stubEnv("SHEET_FIXTURES_DIR", "tests/fixtures");
  vi.stubEnv("VERCEL", "");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Không được gọi mạng khi dùng dữ liệu mẫu")));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.resetModules();
  sheet = await import("@/lib/sheet-data");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("dữ liệu mẫu qua các hàm đọc thật", () => {
  it("Tài liệu: 24 mục, bỏ dòng trùng, link javascript:/data: và dòng thiếu link", async () => {
    const resources = await sheet.getResources();
    expect(resources).toHaveLength(24);
    expect(resources.filter((r) => r.featured)).toHaveLength(3);
    expect(resources.some((r) => /PHẢI BỊ LOẠI/.test(r.title))).toBe(false);
    expect(resources.every((r) => /^https?:\/\//.test(r.url))).toBe(true);
    expect(resources.filter((r) => r.title.startsWith("Hướng dẫn STM32")).length).toBe(1);
    expect(new Set(resources.map((r) => r.level))).toEqual(new Set(["Core", "Reference", "Practice"]));
  });

  it("Inventory: 26 món; giữ hai món cùng tên khác vị trí; gỡ datasheet độc; bỏ món thiếu id", async () => {
    const items = await sheet.getInventory();
    expect(items).toHaveLength(26);
    expect(items.some((i) => /PHẢI BỊ LOẠI/.test(i.title))).toBe(false);
    expect(items.filter((i) => i.title === "Kìm cắt chân linh kiện")).toHaveLength(2);
    expect(items.find((i) => /Datasheet độc/.test(i.title))?.datasheet).toBe("");
    expect(new Set(items.map((i) => i.manufacturer)).size).toBeGreaterThanOrEqual(7); // đủ để thử "Xem thêm" của bộ lọc
    expect(new Set(items.map((i) => i.category)).size).toBe(5);
  });

  it("Khóa học: 3 khóa, 9/6/4 bài, khóa đầu có hai nhánh AVR và ARM", async () => {
    const courses = await sheet.getCourses();
    expect(courses.map((c) => c.lessonCount)).toEqual([9, 6, 4]);
    expect(courses[0].tracks.map((t) => t.name)).toEqual(["AVR", "ARM Cortex-M"]);
  });

  it("Sự kiện: 11, có cả sắp tới, đã qua và chưa chốt lịch (ngày tương đối theo hôm nay)", async () => {
    const events = await sheet.getEvents();
    expect(events).toHaveLength(11);
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
    expect(events.filter((e) => e.date && e.date >= today).length).toBeGreaterThanOrEqual(5);
    expect(events.filter((e) => e.date && e.date < today).length).toBeGreaterThanOrEqual(4);
    expect(events.filter((e) => !e.date)).toHaveLength(1);
  });

  it("Tin tức: 4 khu, link độc bị gỡ nhưng tin vẫn hiện", async () => {
    const news = await sheet.getNews();
    expect(new Set(news.map((n) => n.section))).toEqual(new Set(["headlines", "latest", "media", "features"]));
    expect(news).toHaveLength(13);
    expect(news.find((n) => /link độc/.test(n.title))?.url).toBe("");
  });

  it("Các tab còn lại có đủ dữ liệu", async () => {
    expect(await sheet.getCampus()).toHaveLength(6);
    expect(await sheet.getStudents()).toHaveLength(5);
    expect(await sheet.getOverviewStats()).toHaveLength(4);
    const research = await sheet.getResearchInfo();
    expect([research.focus.length, research.project.length, research.achievement.length, research.publication.length]).toEqual([3, 2, 1, 1]);
    const admissions = await sheet.getAdmissionsInfo();
    expect(admissions.status).not.toBeNull();
    expect([admissions.steps.length, admissions.requirements.length, admissions.tracks.length, admissions.timeline.length, admissions.faqs.length]).toEqual([4, 3, 3, 3, 3]);
  });
});

describe("an toàn của chế độ dữ liệu mẫu", () => {
  it("tự tắt khi chạy trên Vercel: không bao giờ hiện dữ liệu giả ngoài đời thật", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.resetModules();
    const { loadSheet, fixturesEnabled } = await import("@/lib/sheet-source");
    expect(fixturesEnabled()).toBe(false);
    const result = await loadSheet(env.EVENTS_SHEET_CSV_URL, "events"); // fetch bị chặn nên phải thất bại, không đọc file mẫu
    expect(result.state).toBe("failed");
  });

  it("tên file mẫu chỉ nhận chữ, số, gạch: không đọc được file ngoài thư mục", async () => {
    const { loadSheet } = await import("@/lib/sheet-source");
    const result = await loadSheet("https://docs.google.com/spreadsheets/d/e/FIXTURE-../../package/pub?output=csv", "x");
    expect(result.rows).toEqual([]);
  });
});
