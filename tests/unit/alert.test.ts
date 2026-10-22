import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSafeWebhookUrl, notify, resetAlertState } from "@/lib/alert";

const HOOK = "https://discord.com/api/webhooks/123456/abcdefghijklmnopqrstuvwxyz"; // secret-scan:allow (địa chỉ giả dùng làm dữ liệu thử)

beforeEach(() => {
  resetAlertState();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-13T00:00:00Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const ok = () => vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

describe("isSafeWebhookUrl", () => {
  it.each([HOOK, "https://hooks.slack.com/services/T0/B0/xxxxxxxxxxxxxxxxxxxxxxxx"])("nhận %s", (u) => expect(isSafeWebhookUrl(u)).toBe(true)); // secret-scan:allow (địa chỉ giả dùng làm dữ liệu thử)
  it.each(["http://discord.com/api/webhooks/1/x", "https://localhost/x", "https://127.0.0.1/x", "https://10.0.0.5/x", "https://192.168.1.1/x", "https://172.16.0.1/x", "https://169.254.169.254/latest", "https://user:pw@discord.com/x", "https://db.internal/x", "ftp://x.com", "", undefined, "không phải link"])("từ chối %s", (u) => expect(isSafeWebhookUrl(u as string)).toBe(false)); // secret-scan:allow (địa chỉ giả dùng làm dữ liệu thử)
});

describe("notify", () => {
  it("chưa cấu hình webhook: không gọi mạng, trả false", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    expect(await notify({ title: "x", fingerprint: "a" })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("webhook không an toàn thì không gửi", async () => {
    vi.stubEnv("ALERT_WEBHOOK_URL", "https://127.0.0.1/hook");
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    expect(await notify({ title: "x", fingerprint: "a" })).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("gửi đúng định dạng cho Discord (content) và Slack (text)", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ALERT_WEBHOOK_URL", HOOK);
    expect(await notify({ title: "Sheet hỏng", detail: "events: failed", fingerprint: "a" })).toBe(true);
    const discord = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(discord.content).toContain("Sheet hỏng");
    expect(discord.content).toContain("events: failed");
    expect(discord.text).toBeUndefined();

    vi.stubEnv("ALERT_WEBHOOK_URL", "https://hooks.slack.com/services/T0/B0/xxxxxxxxxxxxxxxxxxxxxxxx"); // secret-scan:allow (địa chỉ giả dùng làm dữ liệu thử)
    expect(await notify({ title: "Khác", fingerprint: "b" })).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).text).toContain("Khác");
  });

  it("cùng lỗi không gửi lặp trong 15 phút, sau 15 phút thì gửi lại", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ALERT_WEBHOOK_URL", HOOK);
    expect(await notify({ title: "x", fingerprint: "same" })).toBe(true);
    expect(await notify({ title: "x", fingerprint: "same" })).toBe(false);
    vi.setSystemTime(new Date("2026-10-13T00:16:00Z"));
    expect(await notify({ title: "x", fingerprint: "same" })).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("tối đa 20 tin mỗi giờ dù mỗi tin có fingerprint khác nhau (chống bị làm ngập)", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ALERT_WEBHOOK_URL", HOOK);
    let sent = 0;
    for (let i = 0; i < 50; i++) if (await notify({ title: "x", fingerprint: `f${i}` })) sent++;
    expect(sent).toBe(20);
    vi.setSystemTime(new Date("2026-10-13T01:01:00Z"));
    expect(await notify({ title: "x", fingerprint: "sau-1-gio" })).toBe(true);
  });

  it("force bỏ qua giới hạn (nút gửi thử của admin)", async () => {
    const fetchMock = ok();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ALERT_WEBHOOK_URL", HOOK);
    await notify({ title: "x", fingerprint: "t" });
    expect(await notify({ title: "x", fingerprint: "t", force: true })).toBe(true);
  });

  it("webhook trả lỗi hoặc mạng hỏng: không ném lỗi, không tính là đã gửi", async () => {
    vi.stubEnv("ALERT_WEBHOOK_URL", HOOK);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    await expect(notify({ title: "x", fingerprint: "e1" })).resolves.toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("mạng hỏng")));
    await expect(notify({ title: "x", fingerprint: "e1" })).resolves.toBe(false);
    // Lần gửi thất bại không chiếm suất "đã gửi", nên lần sau gửi được.
    vi.stubGlobal("fetch", ok());
    await expect(notify({ title: "x", fingerprint: "e1" })).resolves.toBe(true);
  });
});
