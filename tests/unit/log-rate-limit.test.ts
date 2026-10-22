import { afterEach, describe, expect, it, vi } from "vitest";
import { logEvent } from "@/lib/log";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

afterEach(() => vi.restoreAllMocks());

describe("logEvent", () => {
  it("ghi một dòng JSON có level, event, thời gian và dữ liệu", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logEvent("error", "client_error", { path: "/events", n: 3 });
    const entry = JSON.parse(spy.mock.calls[0][0]);
    expect(entry).toMatchObject({ level: "error", event: "client_error", path: "/events", n: 3 });
    expect(new Date(entry.t).toString()).not.toBe("Invalid Date");
  });
  it("cắt chuỗi dài để không làm đầy nhật ký", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logEvent("warn", "x", { stack: "a".repeat(5000) });
    expect(JSON.parse(spy.mock.calls[0][0]).stack.length).toBeLessThan(600);
  });
  it("dùng đúng kênh theo mức: info -> log, warn -> warn, error -> error", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    logEvent("info", "a");
    logEvent("warn", "b");
    logEvent("error", "c");
    expect([log.mock.calls.length, warn.mock.calls.length, error.mock.calls.length]).toEqual([1, 1, 1]);
  });
});

describe("createRateLimiter", () => {
  it("cho tối đa N lần trong cửa sổ rồi chặn, theo từng khoá riêng", () => {
    const limiter = createRateLimiter(3, 1000);
    expect([1, 2, 3].map(() => limiter.allow("a", 0))).toEqual([true, true, true]);
    expect(limiter.allow("a", 10)).toBe(false);
    expect(limiter.allow("b", 10)).toBe(true);
  });
  it("hết cửa sổ thì cho lại", () => {
    const limiter = createRateLimiter(1, 1000);
    expect(limiter.allow("a", 0)).toBe(true);
    expect(limiter.allow("a", 500)).toBe(false);
    expect(limiter.allow("a", 1001)).toBe(true);
  });
  it("bộ nhớ có trần: gọi với rất nhiều khoá khác nhau không phình vô hạn", () => {
    const limiter = createRateLimiter(1, 60_000);
    for (let i = 0; i < 6000; i++) limiter.allow(`k${i}`, 0);
    expect(limiter.allow("k0", 1)).toBe(true); // khoá cũ nhất đã bị loại nên được tính như mới
  });
});

describe("clientIp", () => {
  it("lấy IP đầu tiên trong x-forwarded-for, rồi x-real-ip, rồi unknown", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
