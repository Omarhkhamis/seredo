import { NextResponse } from "next/server";
import {
  createAdminUser,
  getCurrentAdminFromRequest,
  isFullAdmin,
  listAdminUsers,
  normalizeAdminRole,
} from "@/lib/admin-auth";

function isDuplicateEmailError(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export async function GET(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!isFullAdmin(admin)) {
    return NextResponse.json({ message: "لا تملك صلاحية إدارة المدراء." }, { status: 403 });
  }

  const admins = await listAdminUsers();

  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!isFullAdmin(admin)) {
    return NextResponse.json({ message: "لا تملك صلاحية إدارة المدراء." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { email?: string; password?: string; role?: string };
    const createdAdmin = await createAdminUser(
      body.email ?? "",
      body.password ?? "",
      normalizeAdminRole(body.role),
    );
    const admins = await listAdminUsers();

    return NextResponse.json({
      admin: createdAdmin,
      admins,
      message: "تمت إضافة المدير بنجاح.",
    });
  } catch (error) {
    const message = isDuplicateEmailError(error)
      ? "هذا البريد مستخدم بالفعل."
      : error instanceof Error
        ? error.message
        : "تعذرت إضافة المدير.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
