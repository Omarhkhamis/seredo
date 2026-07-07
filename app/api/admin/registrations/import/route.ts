import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentAdminFromRequest, isFullAdmin } from "@/lib/admin-auth";
import {
  REGISTRATION_CONFIG,
  importRegistrations,
  type ImportRegistrationRow,
  type RegistrationType,
} from "@/lib/registrations";
import { hasDatabaseConnection } from "@/lib/db";
import { resolveRequestOrigin } from "@/lib/request-origin";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

// نفس أعمدة شيتات Google في example.gs، بنفس الترتيب.
const columnOrder = [
  "registeredAt",
  "registrationId",
  "fullName",
  "phone",
  "jobTitle",
  "email",
  "company",
  "city",
  "verifyUrl",
  "attendance",
] as const;

type ColumnKey = (typeof columnOrder)[number];

const headerLabels: Record<string, ColumnKey> = {
  "تاريخ التسجيل": "registeredAt",
  "رقم التسجيل": "registrationId",
  "اسم الشخص": "fullName",
  "رقم الجوال": "phone",
  "الوظيفة": "jobTitle",
  "الإيميل": "email",
  "الشركة": "company",
  "المدينة": "city",
  "رابط التحقق": "verifyUrl",
  "حالة الحضور": "attendance",
};

function cellText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value).trim();
}

function parseSheetDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = cellText(value);

  if (!text) {
    return null;
  }

  // صيغة تصدير Google Sheets العربية: "1:04:50 م 2026/06/15" بتوقيت الرياض.
  const match = text.match(/(\d{1,2}):(\d{2}):(\d{2})\s*([صم])\s*(\d{4})\/(\d{1,2})\/(\d{1,2})/);

  if (match) {
    const pad = (part: string | number) => String(part).padStart(2, "0");
    let hour = Number(match[1]) % 12;

    if (match[4] === "م") {
      hour += 12;
    }

    const parsed = new Date(
      `${match[5]}-${pad(match[6])}-${pad(match[7])}T${pad(hour)}:${match[2]}:${match[3]}+03:00`,
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(text);

  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function extractRegistrationId(idCell: string, verifyCell: string) {
  const direct = idCell.match(/SEREDO-(VIS|EXH)-\d{4}-\d+/i);

  if (direct) {
    return direct[0].toUpperCase();
  }

  try {
    const url = new URL(verifyCell);
    const fromUrl = (url.searchParams.get("id") ?? "").match(/SEREDO-(VIS|EXH)-\d{4}-\d+/i);

    if (fromUrl) {
      return fromUrl[0].toUpperCase();
    }
  } catch {
    // ليست رابطاً صالحاً.
  }

  return "";
}

function registrationTypeFromId(registrationId: string): RegistrationType | null {
  if (registrationId.includes("-VIS-")) {
    return "visitor";
  }

  if (registrationId.includes("-EXH-")) {
    return "exhibitor";
  }

  return null;
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  if (!isFullAdmin(admin)) {
    return NextResponse.json({ message: "لا تملك صلاحية استيراد التسجيلات." }, { status: 403 });
  }

  if (!hasDatabaseConnection()) {
    return NextResponse.json(
      { message: "قاعدة البيانات غير مضبوطة، لا يمكن استيراد التسجيلات." },
      { status: 503 },
    );
  }

  let file: File | null = null;

  try {
    const formData = await request.formData();
    const entry = formData.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ message: "صيغة الطلب غير صحيحة." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ message: "يرجى اختيار ملف Excel أو CSV." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ message: "حجم الملف أكبر من 8MB." }, { status: 400 });
  }

  let sheetRows: unknown[][];

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // ملفات Excel تبدأ بتوقيع ZIP (PK) أو توقيع XLS القديم، وما عداها نعامله كنص CSV
    // بترميز UTF-8 لأن قراءة SheetJS المباشرة للـ CSV تخرب الأحرف العربية.
    const isBinaryWorkbook =
      (buffer[0] === 0x50 && buffer[1] === 0x4b) ||
      (buffer[0] === 0xd0 && buffer[1] === 0xcf);
    const workbook = isBinaryWorkbook
      ? XLSX.read(buffer, { type: "buffer", cellDates: true })
      : XLSX.read(buffer.toString("utf8").replace(/^\uFEFF/, ""), {
          type: "string",
          cellDates: true,
        });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!firstSheet) {
      throw new Error("empty workbook");
    }

    sheetRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
      header: 1,
      raw: true,
      defval: "",
    });
  } catch {
    return NextResponse.json(
      { message: "تعذر قراءة الملف. تأكد أنه ملف Excel (.xlsx) أو CSV صالح." },
      { status: 400 },
    );
  }

  const dataRows = sheetRows.filter((row) =>
    row.some((cell) => cellText(cell) !== ""),
  );

  if (dataRows.length === 0) {
    return NextResponse.json({ message: "الملف فارغ، لا توجد صفوف للاستيراد." }, { status: 400 });
  }

  // إذا احتوى الصف الأول على عناوين الشيت نعتمدها، وإلا نعتمد ترتيب الأعمدة نفسه.
  const columnIndex = new Map<ColumnKey, number>();
  const firstRowLabels = dataRows[0].map((cell) => cellText(cell));
  const hasHeader = firstRowLabels.some((label) => headerLabels[label]);

  if (hasHeader) {
    firstRowLabels.forEach((label, index) => {
      const key = headerLabels[label];

      if (key !== undefined && !columnIndex.has(key)) {
        columnIndex.set(key, index);
      }
    });
  } else {
    columnOrder.forEach((key, index) => {
      columnIndex.set(key, index);
    });
  }

  const bodyRows = hasHeader ? dataRows.slice(1) : dataRows;
  const read = (row: unknown[], key: ColumnKey) => {
    const index = columnIndex.get(key);

    return index === undefined ? "" : cellText(row[index]);
  };

  const rowsToImport: ImportRegistrationRow[] = [];
  const errors: Array<{ row: number; reason: string }> = [];
  const seenIds = new Set<string>();

  bodyRows.forEach((row, index) => {
    const rowNumber = index + (hasHeader ? 2 : 1);
    const registrationId = extractRegistrationId(
      read(row, "registrationId"),
      read(row, "verifyUrl"),
    );

    if (!registrationId) {
      errors.push({ row: rowNumber, reason: "رقم التسجيل مفقود أو ليس بصيغة SEREDO." });
      return;
    }

    const type = registrationTypeFromId(registrationId);

    if (!type) {
      errors.push({ row: rowNumber, reason: `نوع التسجيل غير معروف: ${registrationId}` });
      return;
    }

    if (seenIds.has(registrationId)) {
      errors.push({ row: rowNumber, reason: `رقم مكرر داخل الملف: ${registrationId}` });
      return;
    }

    const fullName = read(row, "fullName");

    if (!fullName) {
      errors.push({ row: rowNumber, reason: `اسم الشخص مفقود للرقم ${registrationId}` });
      return;
    }

    seenIds.add(registrationId);

    const attendanceCell = read(row, "attendance");

    rowsToImport.push({
      type,
      registrationId,
      fullName,
      phone: read(row, "phone"),
      jobTitle: read(row, "jobTitle"),
      email: read(row, "email").toLowerCase(),
      company: read(row, "company"),
      city: read(row, "city"),
      attendanceStatus: attendanceCell.includes("تم")
        ? REGISTRATION_CONFIG.ATTENDANCE_PRESENT
        : REGISTRATION_CONFIG.ATTENDANCE_ABSENT,
      registeredAt: parseSheetDate(
        columnIndex.has("registeredAt") ? row[columnIndex.get("registeredAt")!] : "",
      ),
    });
  });

  if (rowsToImport.length === 0) {
    return NextResponse.json(
      {
        message: "لا توجد صفوف صالحة للاستيراد في هذا الملف.",
        errors: errors.slice(0, 10),
      },
      { status: 400 },
    );
  }

  const origin = resolveRequestOrigin(request);

  try {
    const result = await importRegistrations(
      rowsToImport,
      (registrationId) => `${origin}/verify?id=${encodeURIComponent(registrationId)}`,
    );

    return NextResponse.json({
      ok: true,
      total: bodyRows.length,
      inserted: result.inserted,
      skipped: result.skipped,
      failed: errors.length,
      visitors: rowsToImport.filter((row) => row.type === "visitor").length,
      exhibitors: rowsToImport.filter((row) => row.type === "exhibitor").length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر استيراد التسجيلات.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
