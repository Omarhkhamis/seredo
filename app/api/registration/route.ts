import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { createRegistration, type RegistrationType } from "@/lib/registrations";
import { hasDatabaseConnection } from "@/lib/db";
import { resolveRequestOrigin } from "@/lib/request-origin";

type RegistrationPayload = {
  type?: string;
  full_name?: string;
  phone?: string;
  job_title?: string;
  email?: string;
  company?: string;
  city?: string;
};

const requiredFields: Array<keyof Omit<RegistrationPayload, "type">> = [
  "full_name",
  "phone",
  "job_title",
  "email",
  "company",
  "city",
];

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isRegistrationType(value: string): value is RegistrationType {
  return value === "visitor" || value === "exhibitor";
}

function isValidName(value: string) {
  return /^[A-Za-z\u0600-\u06FF\s]{2,}$/.test(value);
}

function isValidPhone(value: string) {
  return /^\d{10}$/.test(value) || /^\+\d{12}$/.test(value) || /^\d{13}$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRegistration(payload: RegistrationPayload) {
  const type = cleanValue(payload.type);

  if (!isRegistrationType(type)) {
    return { ok: false as const, message: "نوع التسجيل غير صحيح." };
  }

  const cleaned = {
    type,
    full_name: cleanValue(payload.full_name),
    phone: cleanValue(payload.phone),
    job_title: cleanValue(payload.job_title),
    email: cleanValue(payload.email).toLowerCase(),
    company: cleanValue(payload.company),
    city: cleanValue(payload.city),
  };

  for (const field of requiredFields) {
    if (!cleaned[field]) {
      return { ok: false as const, message: "يرجى تعبئة جميع الحقول المطلوبة." };
    }
  }

  if (!isValidName(cleaned.full_name)) {
    return { ok: false as const, message: "اكتب الاسم بالأحرف فقط بدون أرقام أو رموز." };
  }

  if (!isValidPhone(cleaned.phone)) {
    return {
      ok: false as const,
      message: "رقم الجوال يجب أن يكون 10 أرقام، أو مع رمز الدولة مثل +966500000000.",
    };
  }

  if (!isValidEmail(cleaned.email)) {
    return { ok: false as const, message: "اكتب بريدًا إلكترونيًا صحيحًا." };
  }

  return { ok: true as const, data: cleaned };
}

function forwardToGoogleWebhook(data: Record<string, string>) {
  const webhookUrl = process.env.GOOGLE_REGISTRATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  // نسخة احتياطية إلى Google Sheets، لا تُعطّل التسجيل المحلي إذا فشلت.
  void fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch(() => undefined);
}

export async function POST(request: Request) {
  let body: RegistrationPayload;

  try {
    body = (await request.json()) as RegistrationPayload;
  } catch {
    return NextResponse.json({ message: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  const validation = validateRegistration(body);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن حفظ التسجيل حالياً." },
      { status: 503 },
    );
  }

  const { type, ...data } = validation.data;
  const origin = resolveRequestOrigin(request);

  try {
    const record = await createRegistration(
      type,
      data,
      (registrationId) => `${origin}/verify?id=${encodeURIComponent(registrationId)}`,
    );

    forwardToGoogleWebhook(validation.data);

    if (type === "exhibitor") {
      return NextResponse.json({
        ok: true,
        type,
        registration_id: record.registrationId,
        full_name: record.fullName,
      });
    }

    const qrDataUrl = await QRCode.toDataURL(record.verifyUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#16224A",
        light: "#FFFFFF",
      },
    });

    return NextResponse.json({
      ok: true,
      type,
      registration_id: record.registrationId,
      full_name: record.fullName,
      verify_url: record.verifyUrl,
      qr_data_url: qrDataUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حفظ التسجيل.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
