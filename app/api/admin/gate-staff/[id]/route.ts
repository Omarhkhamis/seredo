import { NextResponse } from "next/server";
import { getCurrentAdminFromRequest } from "@/lib/admin-auth";
import { hasDatabaseConnection } from "@/lib/db";
import { deleteGateStaff, listGateStaff, updateGateStaff } from "@/lib/gate-staff";

function isDuplicatePinError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن تعديل موظفي البوابة." },
      { status: 503 },
    );
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { name?: string; pin?: string };
    const staffMember = await updateGateStaff(id, body.name ?? "", body.pin ?? "");
    const gateStaff = await listGateStaff();

    return NextResponse.json({
      gateStaff,
      staffMember,
      message: "تم تحديث موظف البوابة.",
    });
  } catch (error) {
    const message = isDuplicatePinError(error)
      ? "هذا الرمز مستخدم بالفعل."
      : error instanceof Error
        ? error.message
        : "تعذر تحديث موظف البوابة.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن حذف موظفي البوابة." },
      { status: 503 },
    );
  }

  try {
    const { id } = await context.params;
    await deleteGateStaff(id);
    const gateStaff = await listGateStaff();

    return NextResponse.json({
      gateStaff,
      message: "تم حذف موظف البوابة.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حذف موظف البوابة.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
