import { NextResponse } from "next/server";
import { getCurrentAdminFromRequest } from "@/lib/admin-auth";
import { listRegistrations } from "@/lib/registrations";
import { hasDatabaseConnection } from "@/lib/db";

export async function GET(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن تحميل التسجيلات." },
      { status: 503 },
    );
  }

  try {
    const registrations = await listRegistrations();

    return NextResponse.json({
      visitors: registrations.filter((registration) => registration.type === "visitor"),
      exhibitors: registrations.filter((registration) => registration.type === "exhibitor"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحميل التسجيلات.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
