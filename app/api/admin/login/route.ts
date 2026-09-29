import { NextResponse } from "next/server";
import { isCorrectPassword, setAdminCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!isCorrectPassword(password)) {
    return NextResponse.json({ error: "Sai mật khẩu hoặc chưa cấu hình ADMIN_PASSWORD trong .env.local." }, { status: 401 });
  }

  await setAdminCookie(password);
  return NextResponse.json({ ok: true });
}
