import { NextResponse } from "next/server";
import { getHealthSnapshot } from "@/lib/health";

// Covered by /admin/:path* Basic Auth in proxy.ts. Do not cache sensitive diagnostics.
export const dynamic = "force-dynamic";

export async function GET() {
  const { privateData, httpStatus } = await getHealthSnapshot();
  return NextResponse.json(privateData, { status: httpStatus, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
