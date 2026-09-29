import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";

const cookieName = "embedded_admin_session";

export function makeAdminToken(password: string) {
  const { adminSecret } = getEnv();
  return crypto.createHmac("sha256", adminSecret).update(password).digest("hex");
}

export function isCorrectPassword(password: string) {
  const { adminPassword } = getEnv();
  return Boolean(adminPassword && password === adminPassword);
}

export async function isAdminAuthenticated() {
  const { adminPassword } = getEnv();
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  return Boolean(adminPassword && token && token === makeAdminToken(adminPassword));
}

export async function setAdminCookie(password: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, makeAdminToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
