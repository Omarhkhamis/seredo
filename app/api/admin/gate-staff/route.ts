import { NextResponse } from "next/server";
import { getCurrentAdminFromRequest } from "@/lib/admin-auth";
import { hasDatabaseConnection } from "@/lib/db";
import { createGateStaff, listGateStaff } from "@/lib/gate-staff";

function isDuplicatePinError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export async function GET(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن تحميل موظفي البوابة." },
      { status: 503 },
    );
  }

  try {
    const gateStaff = await listGateStaff();

    return NextResponse.json({ gateStaff });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحميل موظفي البوابة.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن إضافة موظفي البوابة." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { name?: string; pin?: string };
    const staffMember = await createGateStaff(body.name ?? "", body.pin ?? "");
    const gateStaff = await listGateStaff();

    return NextResponse.json({
      gateStaff,
      staffMember,
      message: "تمت إضافة موظف البوابة.",
    });
  } catch (error) {
    const message = isDuplicatePinError(error)
      ? "هذا الرمز مستخدم بالفعل."
      : error instanceof Error
        ? error.message
        : "تعذرت إضافة موظف البوابة.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
