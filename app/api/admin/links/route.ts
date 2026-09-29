import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createResource, getResources } from "@/lib/resource-store";
import type { ResourceInput } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getResources());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Partial<ResourceInput> | null;
  if (!body?.title || !body.url || !body.description) {
    return NextResponse.json({ error: "Thiếu title, url hoặc description." }, { status: 400 });
  }

  try {
    const resource = await createResource({
      title: body.title,
      description: body.description,
      url: body.url,
      type: body.type || "Website",
      topic: body.topic || "Embedded",
      level: body.level || "Core",
      source: body.source || "Link",
      is_featured: Boolean(body.is_featured)
    });
    return NextResponse.json({ resource });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
