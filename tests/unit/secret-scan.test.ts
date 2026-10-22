import { describe, expect, it } from "vitest";
import { scanText } from "../../scripts/secret-scan.mjs";

// Các "khóa" dưới đây ghép từ nhiều mảnh lúc chạy để chính file test không bị máy quét báo.
const jwt = (role: string) => ["eyJhbGciOiJIUzI1NiJ9", Buffer.from(JSON.stringify({ role })).toString("base64url"), "c2lnbmF0dXJlMTIzNDU2"].join(".");
const rules = (text: string) => scanText(text).map((f) => f.rule);

describe("scanText: phải bắt", () => {
  it("khóa service_role của Supabase (JWT), nhưng không báo khóa anon công khai", () => {
    expect(rules(`SUPABASE_KEY=${jwt("service_role")}`)).toContain("supabase-service-role-key");
    expect(rules(`SUPABASE_KEY=${jwt("anon")}`)).toEqual([]);
  });
  it("khóa bí mật kiểu mới của Supabase", () => {
    expect(rules(`X=${"sb_" + "secret_"}${"a".repeat(30)}`)).toContain("supabase-secret-key");
  });
  it.each([
    ["private-key", `-----BEGIN ${"RSA "}PRIVATE KEY-----`],
    ["aws-access-key", "AK" + "IA" + "ABCDEFGHIJKLMNOP"],
    ["github-token", "gh" + "p_" + "a".repeat(36)],
    ["stripe-live-key", "sk_" + "live_" + "a".repeat(20)],
    ["slack-token", "xo" + "xb-" + "1234567890-abcdef"],
    ["google-api-key", "AI" + "za" + "a".repeat(35)],
    ["discord-webhook", "https://discord.com/api/" + "webhooks/" + "123456/" + "a".repeat(30)],
    ["slack-webhook", "https://hooks.slack.com/" + "services/T0AAAA/B0AAAA/" + "a".repeat(20)],
    ["google-sheet-publish-link", "https://docs.google.com/spreadsheets/d/e/" + "2PACX-" + "a".repeat(30) + "/pub?output=csv"]
  ])("%s", (rule, sample) => expect(rules(`dòng: ${sample}`)).toContain(rule));
  it("biến có tên bí mật gán giá trị dài thật", () => {
    expect(rules(`MY_API_KEY=${"x1y2z3".repeat(6)}`)).toContain("secret-assignment");
    expect(rules(`export CLIENT_SECRET="${"Ab9".repeat(8)}"`)).toContain("secret-assignment");
  });
  it("báo đúng số dòng", () => {
    expect(scanText(`ok\nok\nKEY=${"sb_" + "secret_"}${"a".repeat(30)}`)[0].line).toBe(3);
  });
});

describe("scanText: không được báo nhầm", () => {
  it.each([
    "ADMIN_PASSWORD=",
    "ALERT_WEBHOOK_URL=",
    "SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY",
    "ADMIN_SECRET=change-this-to-a-long-secret",
    "const key = process.env.SOME_API_KEY;",
    "NEWS_SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_ID/pub?gid=1&single=true&output=csv",
    "MY_API_KEY=xxxxxxxxxxxxxxxxxxxx",
    "chuỗi bình thường không có gì đặc biệt"
  ])("%s", (line) => expect(scanText(line)).toEqual([]));
  it("dòng có chú thích secret-scan:allow bị bỏ qua", () => {
    expect(scanText(`KEY=${"sb_" + "secret_"}${"a".repeat(30)} // secret-scan:allow`)).toEqual([]);
  });
});
