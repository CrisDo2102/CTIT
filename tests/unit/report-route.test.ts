import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const HOOK = "https://discord.com/api/webhooks/123456/abcdefghijklmnopqrstuvwxyz"; // secret-scan:allow (địa chỉ giả dùng làm dữ liệu thử)
let POST: (request: Request) => Promise<Response>;
let ipCounter = 0;

const valid = { type: "error", message: "Cannot read properties of undefined", path: "/events", stack: "at x (/_next/static/a.js:1:1)" };
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/report", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { host: "localhost", origin: "http://localhost", "x-forwarded-for": `10.0.0.${++ipCounter}`, ...headers }
  });

beforeEach(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.resetModules();
  ({ POST } = await import("@/app/api/report/route"));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/report", () => {
  it("báo cáo hợp lệ: 204 và ghi nhật ký có cấu trúc", async () => {
    const spy = vi.spyOn(console, "error");
    expect((await POST(req(valid))).status).toBe(204);
    const line = JSON.parse(spy.mock.calls.map((c) => c[0]).find((l) => String(l).includes("client_error")));
    expect(line).toMatchObject({ event: "client_error", path: "/events", type: "error" });
  });

  it("gửi cảnh báo ra webhook khi đã cấu hình", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ALERT_WEBHOOK_URL", HOOK);
    vi.resetModules();
    ({ POST } = await import("@/app/api/report/route"));
    await POST(req(valid));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).content).toContain("Cannot read properties");
  });

  it.each([
    ["khác nguồn gốc (Origin)", { origin: "https://evil.example" }],
    ["Sec-Fetch-Site: cross-site", { "sec-fetch-site": "cross-site" }],
    ["Origin hỏng", { origin: "not a url" }]
  ])("chặn: %s", async (_name, headers) => {
    expect((await POST(req(valid, headers))).status).toBe(403);
  });

  it("từ chối nội dung quá lớn (413) cả khi khai báo lẫn khi thực tế", async () => {
    expect((await POST(req(valid, { "content-length": "999999" }))).status).toBe(413);
    expect((await POST(req({ ...valid, message: "a".repeat(200), stack: "b".repeat(700), extra: "c".repeat(4000) }))).status).toBe(413);
  });

  it.each([
    ["không phải JSON", "{hỏng"],
    ["JSON không phải đối tượng", "123"],
    ["thiếu message", { type: "error", path: "/x" }],
    ["type lạ", { ...valid, type: "hack" }],
    ["message quá dài", { ...valid, message: "a".repeat(301) }],
    ["path không bắt đầu bằng /", { ...valid, path: "evil.com" }],
    ["trường sai kiểu", { ...valid, message: 123 }]
  ])("400 khi %s", async (_name, body) => {
    expect((await POST(req(body))).status).toBe(400);
  });

  it("giới hạn 20 báo cáo mỗi IP, IP khác vẫn gửi được", async () => {
    const ip = { "x-forwarded-for": "203.0.113.9" };
    const results: number[] = [];
    for (let i = 0; i < 22; i++) results.push((await POST(req(valid, ip))).status);
    expect(results.filter((s) => s === 204)).toHaveLength(20);
    expect(results.slice(20)).toEqual([429, 429]);
    expect((await POST(req(valid, { "x-forwarded-for": "203.0.113.10" }))).status).toBe(204);
  });
});
