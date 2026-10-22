import { NextResponse } from "next/server";
import { appVersion } from "@/data/changelog";
import { notify } from "@/lib/alert";
import { checkSheets, fixturesEnabled } from "@/lib/sheet-source";

// Tình trạng hệ thống cho người vận hành và công cụ giám sát (UptimeRobot, Better Stack...).
// - 200 { status: "ok" }: mọi Sheet đã cấu hình đều tải được (hoặc chưa cấu hình Sheet nào).
// - 200 { status: "degraded" }: có Sheet đang dùng bản dữ liệu cũ (lần tải mới nhất lỗi).
// - 503 { status: "down" }: có Sheet lỗi hẳn và chưa có bản nào để dùng tạm.
// Kết quả được đệm 60 giây (cùng nhịp với trang) nên gọi dồn dập cũng chỉ tải Sheet tối đa mỗi phút một lần.
// Không trả về link Sheet hay nội dung, chỉ tên tab, trạng thái, số dòng và thời gian tải.
export const revalidate = 60;

export async function GET() {
  const sheets = await checkSheets();
  const configured = Object.values(sheets).filter((sheet) => sheet.configured);
  const down = configured.some((sheet) => sheet.state === "failed" || sheet.state === "rejected");
  const stale = configured.some((sheet) => sheet.state === "stale");
  const status = down ? "down" : stale ? "degraded" : "ok";

  // Có công cụ giám sát gọi định kỳ vào đây, nên đây cũng là chỗ tự báo khi Sheet hỏng (cảnh báo bị giới hạn tần suất).
  if (status !== "ok") {
    const bad = Object.entries(sheets)
      .filter(([, sheet]) => sheet.configured && sheet.state !== "ok")
      .map(([name, sheet]) => `${name}: ${sheet.state}`);
    await notify({ title: status === "down" ? "Google Sheet không tải được" : "Google Sheet đang dùng bản dữ liệu cũ", detail: bad.join("\n"), fingerprint: `health:${bad.join("|")}`, level: down ? "error" : "warn" });
  }

  return NextResponse.json(
    { status, version: appVersion, build: process.env.NEXT_PUBLIC_BUILD_STAMP ?? null, alerts: Boolean(process.env.ALERT_WEBHOOK_URL), fixtures: fixturesEnabled(), sheets },
    { status: down ? 503 : 200, headers: { "X-Robots-Tag": "noindex" } }
  );
}
