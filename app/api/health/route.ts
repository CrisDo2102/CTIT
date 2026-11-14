import { NextResponse } from "next/server";
import { getHealthSnapshot } from "@/lib/health";

// Public uptime check: never reveal which integrations are configured, row counts, timings or alert settings.
// Detailed diagnostics belong at /admin/health, protected by proxy.ts.
export const revalidate = 60;

export async function GET() {
  const { publicData, httpStatus } = await getHealthSnapshot();
  return NextResponse.json(publicData, { status: httpStatus, headers: { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" } });
}
