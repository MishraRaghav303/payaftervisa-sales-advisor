import { NextRequest, NextResponse } from "next/server";

async function tokenFor(username: string, password: string) {
  const data = new TextEncoder().encode(`pav-admin:${username}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const { username, password } = (await req.json()) as {
    username?: string;
    password?: string;
  };
  const adminUsername = process.env.ADMIN_USERNAME ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  const valid =
    username &&
    password &&
    adminUsername &&
    adminPassword &&
    username === adminUsername &&
    password === adminPassword;

  if (!valid) {
    return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", await tokenFor(adminUsername, adminPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
