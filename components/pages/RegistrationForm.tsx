"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Swal from "sweetalert2";
import { downloadVisitorQrCard } from "@/components/pages/visitor-qr-card";

type RegistrationType = "visitor" | "exhibitor";

type RegistrationFormProps = {
  type: RegistrationType;
  logoSrc?: string;
};

type RegistrationResponse = {
  ok?: boolean;
  message?: string;
  registration_id?: string;
  qr_data_url?: string;
  qr_url?: string;
  full_name?: string;
};

type FormState = {
  full_name: string;
  phone: string;
  job_title: string;
  email: string;
  company: string;
  city: string;
};

const initialFormState: FormState = {
  full_name: "",
  phone: "",
  job_title: "",
  email: "",
  company: "",
  city: "",
};

const fields: Array<{
  name: keyof FormState;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  inputMode?: "tel";
}> = [
  {
    name: "full_name",
    label: "اسم الشخص",
    type: "text",
    autoComplete: "name",
    placeholder: "الاسم الكامل",
  },
  {
    name: "phone",
    label: "رقم الجوال",
    type: "tel",
    autoComplete: "tel",
    placeholder: "رقم الجوال",
    inputMode: "tel",
  },
  {
    name: "job_title",
    label: "الوظيفة",
    type: "text",
    autoComplete: "organization-title",
    placeholder: "الوظيفة",
  },
  {
    name: "email",
    label: "الإيميل",
    type: "email",
    autoComplete: "email",
    placeholder: "البريد الإلكتروني",
  },
  {
    name: "company",
    label: "الشركة",
    type: "text",
    autoComplete: "organization",
    placeholder: "اسم الشركة",
  },
  {
    name: "city",
    label: "المدينة",
    type: "text",
    autoComplete: "address-level2",
    placeholder: "المدينة",
  },
];

function isValidName(value: string) {
  return /^[A-Za-z\u0600-\u06FF\s]{2,}$/.test(value.trim());
}

function isValidPhone(value: string) {
  const phone = value.trim();

  return /^\d{10}$/.test(phone) || /^\+\d{12}$/.test(phone) || /^\d{13}$/.test(phone);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateForm(values: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};

  for (const field of fields) {
    if (!values[field.name].trim()) {
      errors[field.name] = "هذا الحقل مطلوب.";
    }
  }

  if (values.full_name && !isValidName(values.full_name)) {
    errors.full_name = "اكتب الاسم بالأحرف فقط بدون أرقام أو رموز.";
  }

  if (values.phone && !isValidPhone(values.phone)) {
    errors.phone = "رقم الجوال يجب أن يكون 10 أرقام، أو مع رمز الدولة مثل +966500000000.";
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.email = "اكتب بريدًا إلكترونيًا صحيحًا.";
  }

  return errors;
}

export function RegistrationForm({ type, logoSrc }: RegistrationFormProps) {
  const [values, setValues] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<RegistrationResponse | null>(null);
  const [isDownloadingCard, setIsDownloadingCard] = useState(false);

  const isVisitor = type === "visitor";

  async function handleDownloadCard() {
    const qrImage = result?.qr_data_url || result?.qr_url;

    if (!qrImage || isDownloadingCard) {
      return;
    }

    setIsDownloadingCard(true);

    try {
      await downloadVisitorQrCard({
        qrImage,
        registrationId: result?.registration_id || "",
        fullName: result?.full_name || "",
        logoSrc,
      });
    } finally {
      setIsDownloadingCard(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setResult(null);
    setMessage("");

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setMessage("يرجى تصحيح الحقول المطلوبة قبل إرسال التسجيل.");
      return;
    }

    setStatus("submitting");
    void Swal.fire({
      title: isVisitor ? "جار توليد رمز الـ QR" : "جاري إرسال التسجيل",
      text: isVisitor
        ? "قد تستغرق العملية حوالي 10 ثوان. يرجى الانتظار وعدم إغلاق الصفحة."
        : "قد تستغرق العملية عدة ثوان. يرجى الانتظار وعدم إغلاق الصفحة.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, ...values }),
      });

      const data = (await response.json()) as RegistrationResponse;

      if (!response.ok || data.ok === false) {
        throw new Error(data.message || "حدث خطأ أثناء التسجيل، حاول مرة أخرى.");
      }

      setValues(initialFormState);
      setResult(data);
      setStatus("success");
      setMessage(isVisitor ? "تم تسجيلك بنجاح." : "تم إرسال طلبك بنجاح.");
      Swal.close();
    } catch (error) {
      Swal.close();
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "حدث خطأ أثناء الإرسال.");
    }
  }

  return (
    <div className="seredo-native-form">
      <div className="seredo-native-form__eyebrow">
        <span />
        سيريدو 2026
      </div>
      <h2>{isVisitor ? "تسجيل الزائرين" : "تسجيل العارضين"}</h2>
      <p className="seredo-native-form__lead">
        {isVisitor
          ? "سجّل بياناتك، وسيظهر لك رمز QR الخاص بك لإبرازه عند دخول المعرض."
          : "سجّل بياناتك كعارض، وسيتم حفظ معلوماتك لدى فريق سيريدو."}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="seredo-native-form__grid">
          {fields.map((field) => (
            <label className="seredo-native-form__field" key={field.name}>
              <span>{field.label}</span>
              <input
                name={field.name}
                type={field.type}
                value={values[field.name]}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
                dir={field.name === "phone" ? "ltr" : "rtl"}
                aria-invalid={Boolean(errors[field.name])}
                onChange={(event) => {
                  setValues((current) => ({ ...current, [field.name]: event.target.value }));
                  setErrors((current) => ({ ...current, [field.name]: undefined }));
                }}
              />
              {errors[field.name] ? (
                <span className="seredo-native-form__field-error">{errors[field.name]}</span>
              ) : null}
            </label>
          ))}
        </div>

        <button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "جاري إرسال التسجيل..." : "إرسال التسجيل"}
        </button>
      </form>

      {message ? (
        <div
          className={
            status === "success"
              ? "seredo-native-form__notice seredo-native-form__notice--success"
              : "seredo-native-form__notice seredo-native-form__notice--error"
          }
        >
          <strong>{message}</strong>
          {status === "success" && result?.registration_id ? (
            <span className="seredo-native-form__registration-id">{result.registration_id}</span>
          ) : null}
          {status === "success" && isVisitor && (result?.qr_data_url || result?.qr_url) ? (
            <>
              <img
                className="seredo-native-form__qr"
                src={result.qr_data_url || result.qr_url}
                alt="QR Code"
              />
              <button
                className="seredo-native-form__qr-download"
                type="button"
                disabled={isDownloadingCard}
                onClick={() => void handleDownloadCard()}
              >
                {isDownloadingCard ? "جاري تجهيز البطاقة..." : "تحميل QR"}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
