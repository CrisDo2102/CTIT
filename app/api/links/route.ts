import { NextResponse } from "next/server";
import { getResources } from "@/lib/resource-store";

export async function GET() {
  const data = await getResources();
  return NextResponse.json(data);
}
