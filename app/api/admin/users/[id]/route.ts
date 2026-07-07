import { NextResponse } from "next/server";
import {
  getCurrentAdminFromRequest,
  isFullAdmin,
  listAdminUsers,
  normalizeAdminRole,
  updateAdminUser,
} from "@/lib/admin-auth";

function isDuplicateEmailError(error: unknown) {
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

  if (!isFullAdmin(admin)) {
    return NextResponse.json({ message: "لا تملك صلاحية إدارة المدراء." }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { email?: string; password?: string; role?: string };
    const updatedAdmin = await updateAdminUser(
      id,
      body.email ?? "",
      body.password || undefined,
      body.role === undefined ? undefined : normalizeAdminRole(body.role),
    );
    const admins = await listAdminUsers();

    return NextResponse.json({
      admin: updatedAdmin,
      admins,
      message: "تم تحديث بيانات المدير.",
    });
  } catch (error) {
    const message = isDuplicateEmailError(error)
      ? "هذا البريد مستخدم بالفعل."
      : error instanceof Error
        ? error.message
        : "تعذر تحديث المدير.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
