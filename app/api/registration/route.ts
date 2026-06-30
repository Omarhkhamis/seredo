import { NextResponse } from "next/server";

type RegistrationType = "visitor" | "exhibitor";

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

  const webhookUrl = process.env.GOOGLE_REGISTRATION_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      {
        message:
          "تم تجهيز الفورم داخل الموقع، لكن رابط Google webhook غير مضبوط بعد.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validation.data),
    });

    const text = await response.text();
    let result: unknown = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { message: text };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: "تعذر إرسال التسجيل إلى Google. حاول مرة أخرى.", details: result },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر إرسال التسجيل.";

    return NextResponse.json({ message }, { status: 502 });
  }
}
