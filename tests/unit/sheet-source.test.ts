import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkSheets, isAllowedSheetUrl, loadSheet, parseCsv, resetSheetCache } from "@/lib/sheet-source";

const URL_OK = "https://docs.google.com/spreadsheets/d/e/abc/pub?output=csv";
const csv = (text: string, init: ResponseInit = {}) => new Response(text, { status: 200, ...init });

beforeEach(() => {
  resetSheetCache();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});
afterEach(() => vi.unstubAllGlobals());

describe("isAllowedSheetUrl", () => {
  it.each(["https://docs.google.com/x", "https://sheets.google.com/x", "https://lh3.googleusercontent.com/x"])("nhận %s", (u) => expect(isAllowedSheetUrl(u)).toBe(true));
  it.each(["http://docs.google.com/x", "https://evil.com/x", "https://docs.google.com.evil.com/x", "https://user@docs.google.com/x", "file:///etc/passwd", "http://169.254.169.254/latest", "không phải link", ""])("từ chối %s", (u) => expect(isAllowedSheetUrl(u)).toBe(false));
});

describe("parseCsv", () => {
  it("đọc ô có dấu ngoặc kép, dấu phẩy, xuống dòng và bỏ dòng trống", () => {
    expect(parseCsv('a,b\r\n"x, y","dòng ""1""\nz"\n,\n')).toEqual([["a", "b"], ["x, y", 'dòng "1"\nz']]);
  });
});

describe("loadSheet", () => {
  it("chưa cấu hình: missing, không gọi mạng", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await loadSheet("", "T")).state).toBe("missing");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("link không phải Google: rejected, không gọi mạng", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await loadSheet("https://evil.com/x.csv", "T")).state).toBe("rejected");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("tải được: ok và có dòng dữ liệu", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(csv("a,b\n1,2")));
    const result = await loadSheet(URL_OK, "T");
    expect(result.state).toBe("ok");
    expect(result.rows).toEqual([["a", "b"], ["1", "2"]]);
  });

  it("lỗi mà chưa có bản nào: failed, trả rỗng", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    const result = await loadSheet(URL_OK, "T");
    expect(result.state).toBe("failed");
    expect(result.rows).toEqual([]);
  });

  it("lần sau lỗi thì dùng bản tốt gần nhất (stale), không để trang trống", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(csv("a\n1")).mockResolvedValueOnce(new Response("", { status: 503 })).mockRejectedValueOnce(new Error("timeout"));
    vi.stubGlobal("fetch", fetchMock);
    expect((await loadSheet(URL_OK, "T")).state).toBe("ok");
    const second = await loadSheet(URL_OK, "T");
    expect(second.state).toBe("stale");
    expect(second.rows).toEqual([["a"], ["1"]]);
    const third = await loadSheet(URL_OK, "T");
    expect(third.state).toBe("stale");
    expect(third.rows).toEqual([["a"], ["1"]]);
  });

  it("phục hồi: sau lỗi mà tải được lại thì thành ok với dữ liệu mới", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(csv("a\n1")).mockResolvedValueOnce(new Response("", { status: 500 })).mockResolvedValueOnce(csv("a\n2"));
    vi.stubGlobal("fetch", fetchMock);
    await loadSheet(URL_OK, "T");
    await loadSheet(URL_OK, "T");
    const back = await loadSheet(URL_OK, "T");
    expect(back.state).toBe("ok");
    expect(back.rows).toEqual([["a"], ["2"]]);
  });

  it("Sheet quá lớn (khai báo content-length) bị bỏ qua", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(csv("a", { headers: { "content-length": String(6 * 1024 * 1024) } })));
    expect((await loadSheet(URL_OK, "T")).state).toBe("failed");
  });

  it("bản tốt của link này không bị dùng cho link khác", async () => {
    const other = "https://docs.google.com/spreadsheets/d/e/other/pub?output=csv";
    const fetchMock = vi.fn().mockResolvedValueOnce(csv("a\n1")).mockResolvedValueOnce(new Response("", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    await loadSheet(URL_OK, "T");
    expect((await loadSheet(other, "T")).state).toBe("failed");
  });
});

describe("checkSheets", () => {
  it("chỉ kiểm tra Sheet đã cấu hình và không để lộ link", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(csv("a\n1\n2")));
    const result = await checkSheets({ NEWS_SHEET_CSV_URL: URL_OK });
    expect(result.news).toMatchObject({ configured: true, state: "ok", rows: 3 });
    expect(result.events).toEqual({ configured: false, state: "missing", rows: 0, ms: 0 });
    expect(JSON.stringify(result)).not.toContain("docs.google.com");
  });
});
