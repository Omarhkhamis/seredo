import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionCookieOptions,
  loginAdmin,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const result = await loginAdmin(body.email ?? "", body.password ?? "");

    if (!result) {
      return NextResponse.json({ message: "البريد الإلكتروني أو كلمة السر غير صحيحة." }, { status: 401 });
    }

    const response = NextResponse.json({
      admin: result.admin,
      message: "تم تسجيل الدخول بنجاح.",
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, result.token, getAdminSessionCookieOptions(result.maxAge));

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تسجيل الدخول.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
