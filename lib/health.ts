import { appVersion } from "@/data/changelog";
import { notify } from "@/lib/alert";
import { checkSheets, fixturesEnabled } from "@/lib/sheet-source";

export async function getHealthSnapshot() {
  const sheets = await checkSheets();
  const configured = Object.values(sheets).filter((sheet) => sheet.configured);
  const down = configured.some((sheet) => sheet.state === "failed" || sheet.state === "rejected");
  const stale = configured.some((sheet) => sheet.state === "stale");
  const status = down ? "down" : stale ? "degraded" : "ok";

  if (status !== "ok") {
    const bad = Object.entries(sheets)
      .filter(([, sheet]) => sheet.configured && sheet.state !== "ok")
      .map(([name, sheet]) => `${name}: ${sheet.state}`);
    await notify({
      title: down ? "Google Sheet không tải được" : "Google Sheet đang dùng bản dữ liệu cũ",
      detail: bad.join("\n"), fingerprint: `health:${bad.join("|")}`,
      level: down ? "error" : "warn"
    });
  }

  return {
    httpStatus: down ? 503 : 200,
    publicData: { status, version: appVersion },
    privateData: {
      status, version: appVersion,
      build: process.env.NEXT_PUBLIC_BUILD_STAMP ?? null,
      alerts: Boolean(process.env.ALERT_WEBHOOK_URL),
      fixtures: fixturesEnabled(), sheets
    }
  };
}
