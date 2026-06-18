import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionCookieOptions,
  logoutAdmin,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? "";

  await logoutAdmin(token);

  const response = NextResponse.json({ message: "تم تسجيل الخروج." });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getAdminSessionCookieOptions(0));

  return response;
}
