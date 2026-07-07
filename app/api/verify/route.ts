import { NextResponse } from "next/server";
import {
  REGISTRATION_CONFIG,
  findVisitorByRegistrationId,
  markVisitorAttended,
} from "@/lib/registrations";
import { isValidGatePin } from "@/lib/gate-staff";
import { hasDatabaseConnection } from "@/lib/db";

type VerifyPayload = {
  action?: string;
  id?: string;
  pin?: string;
};

type VerifyAction = "login" | "lookup" | "attend" | "scan";

function resolveAction(value: unknown): VerifyAction {
  return value === "login" || value === "attend" || value === "scan" ? value : "lookup";
}

function formatRegisteredAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export async function POST(request: Request) {
  let body: VerifyPayload;

  try {
    body = (await request.json()) as VerifyPayload;
  } catch {
    return NextResponse.json({ message: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const action = resolveAction(body.action);
  const registrationId = typeof body.id === "string" ? body.id.trim() : "";
  const pin = typeof body.pin === "string" ? body.pin : "";

  if (!(await isValidGatePin(pin))) {
    return NextResponse.json({ message: "رمز موظف البوابة غير صحيح." }, { status: 401 });
  }

  if (action === "login") {
    return NextResponse.json({ ok: true });
  }

  if (!registrationId) {
    return NextResponse.json({ message: "رقم التسجيل غير موجود في الرابط." }, { status: 400 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن عرض بيانات الزائر." },
      { status: 503 },
    );
  }

  try {
    if (action === "attend") {
      const updated = await markVisitorAttended(registrationId);

      if (!updated) {
        return NextResponse.json(
          { message: "لم يتم العثور على بيانات هذا الزائر." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        ok: true,
        registration_id: updated.registrationId,
        attendance_status: updated.attendanceStatus,
      });
    }

    if (action === "scan") {
      const visitor = await findVisitorByRegistrationId(registrationId);

      if (!visitor) {
        return NextResponse.json(
          { message: "لم يتم العثور على بيانات هذا الزائر." },
          { status: 404 },
        );
      }

      const alreadyAttended =
        visitor.attendanceStatus === REGISTRATION_CONFIG.ATTENDANCE_PRESENT;

      if (!alreadyAttended) {
        await markVisitorAttended(registrationId);
      }

      return NextResponse.json({
        ok: true,
        already_attended: alreadyAttended,
        registration_id: visitor.registrationId,
        full_name: visitor.fullName,
        phone: visitor.phone,
        job_title: visitor.jobTitle,
        email: visitor.email,
        company: visitor.company,
        city: visitor.city,
        registered_at: formatRegisteredAt(visitor.registeredAt),
        attendance_status: REGISTRATION_CONFIG.ATTENDANCE_PRESENT,
      });
    }

    const visitor = await findVisitorByRegistrationId(registrationId);

    if (!visitor) {
      return NextResponse.json(
        { message: "لم يتم العثور على بيانات هذا الزائر." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      already_attended: visitor.attendanceStatus === REGISTRATION_CONFIG.ATTENDANCE_PRESENT,
      registration_id: visitor.registrationId,
      full_name: visitor.fullName,
      phone: visitor.phone,
      job_title: visitor.jobTitle,
      email: visitor.email,
      company: visitor.company,
      city: visitor.city,
      registered_at: formatRegisteredAt(visitor.registeredAt),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ، حاول مرة أخرى.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
