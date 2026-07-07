"use client";

import { Loader2, RefreshCw, Search, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { cn } from "@/components/ui/cn";

const ATTENDANCE_PRESENT = "تم الحضور";
const ATTENDANCE_ABSENT = "لم يحضر";

type RegistrationType = "visitor" | "exhibitor";

type RegistrationRecord = {
  id: number;
  type: RegistrationType;
  registrationId: string;
  fullName: string;
  phone: string;
  jobTitle: string;
  email: string;
  company: string;
  city: string;
  verifyUrl: string;
  attendanceStatus: string;
  registeredAt: string;
};

type AttendanceFilter = "all" | "present" | "absent";

// نفس أعمدة تبويبي "الزائرين" و"العارضين" في Google Sheets.
const visitorHeaders = [
  "تاريخ التسجيل",
  "رقم التسجيل",
  "اسم الشخص",
  "رقم الجوال",
  "الوظيفة",
  "الإيميل",
  "الشركة",
  "المدينة",
  "رابط التحقق",
  "حالة الحضور",
];

const exhibitorHeaders = [
  "تاريخ التسجيل",
  "رقم التسجيل",
  "اسم الشخص",
  "رقم الجوال",
  "الوظيفة",
  "الإيميل",
  "الشركة",
  "المدينة",
];

function formatRegisteredAt(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function matchesSearch(registration: RegistrationRecord, query: string) {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [
    registration.registrationId,
    registration.fullName,
    registration.phone,
    registration.jobTitle,
    registration.email,
    registration.company,
    registration.city,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function RegistrationsSection({
  type,
  canImport = true,
  onUnauthorized,
}: {
  type: RegistrationType;
  canImport?: boolean;
  onUnauthorized: () => void;
}) {
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const isVisitors = type === "visitor";

  const loadRegistrations = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/registrations", { cache: "no-store" });
      const payload = (await response.json()) as {
        visitors?: RegistrationRecord[];
        exhibitors?: RegistrationRecord[];
        message?: string;
      };

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok || !payload.visitors || !payload.exhibitors) {
        throw new Error(payload.message ?? "تعذر تحميل التسجيلات.");
      }

      setRecords(isVisitors ? payload.visitors : payload.exhibitors);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "تعذر تحميل التسجيلات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const importFile = async (file: File) => {
    setIsImporting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/registrations/import", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        inserted?: number;
        skipped?: number;
        failed?: number;
        errors?: Array<{ row: number; reason: string }>;
      };

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "تعذر استيراد الملف.");
      }

      const errorLines = (payload.errors ?? [])
        .map((error) => `صف ${error.row}: ${error.reason}`)
        .join("<br>");

      await Swal.fire({
        icon: payload.failed ? "warning" : "success",
        title: "اكتمل الاستيراد",
        html:
          `<div style="line-height:2">` +
          `تمت إضافة <b>${payload.inserted ?? 0}</b> تسجيل جديد<br>` +
          `تم تخطي <b>${payload.skipped ?? 0}</b> تسجيل موجود مسبقاً` +
          (payload.failed
            ? `<br>تعذر استيراد <b>${payload.failed}</b> صف:<br><small>${errorLines}</small>`
            : "") +
          `</div>`,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#25396E",
      });

      await loadRegistrations();
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر استيراد الملف.";
      setErrorMessage(message);
      void Swal.fire({
        icon: "error",
        title: "تعذر الاستيراد",
        text: message,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#25396E",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const cities = useMemo(() => {
    const unique = new Set(
      records.map((registration) => registration.city.trim()).filter(Boolean),
    );

    return Array.from(unique).sort((a, b) => a.localeCompare(b, "ar"));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((registration) => {
      if (!matchesSearch(registration, searchQuery)) {
        return false;
      }

      if (cityFilter !== "all" && registration.city.trim() !== cityFilter) {
        return false;
      }

      if (isVisitors && attendanceFilter !== "all") {
        const isPresent = registration.attendanceStatus === ATTENDANCE_PRESENT;

        if (attendanceFilter === "present" && !isPresent) {
          return false;
        }

        if (attendanceFilter === "absent" && isPresent) {
          return false;
        }
      }

      const registeredAt = new Date(registration.registeredAt);

      if (dateFrom && registeredAt < new Date(`${dateFrom}T00:00:00`)) {
        return false;
      }

      if (dateTo && registeredAt > new Date(`${dateTo}T23:59:59.999`)) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, cityFilter, attendanceFilter, dateFrom, dateTo, isVisitors]);

  const presentCount = useMemo(
    () => records.filter((visitor) => visitor.attendanceStatus === ATTENDANCE_PRESENT).length,
    [records],
  );

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    cityFilter !== "all" ||
    attendanceFilter !== "all" ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const clearFilters = () => {
    setSearchQuery("");
    setCityFilter("all");
    setAttendanceFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const headers = isVisitors ? visitorHeaders : exhibitorHeaders;
  const filterControlClass =
    "min-h-11 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/10";

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-xl text-brand-800">{isVisitors ? "الزائرين" : "العارضين"}</h2>
          <p className="mt-1 text-xs font-bold text-muted">
            {isVisitors
              ? `${records.length} زائر (${presentCount} حضروا)`
              : `${records.length} عارض`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canImport ? (
          <label
            className={cn(
              "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-800",
              isImporting && "pointer-events-none opacity-60",
            )}
          >
            {isImporting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Upload size={16} aria-hidden="true" />
            )}
            {isImporting ? "جاري الاستيراد..." : "استيراد ملف"}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              disabled={isImporting}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";

                if (file) {
                  void importFile(file);
                }
              }}
            />
          </label>
          ) : null}
          <button
            type="button"
            onClick={() => void loadRegistrations()}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw size={16} aria-hidden="true" />
            )}
            تحديث
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-line bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block text-xs font-extrabold text-ink">
            بحث
            <div className="relative mt-1.5">
              <Search
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="الاسم، رقم التسجيل، الجوال، الإيميل..."
                className={cn(filterControlClass, "pr-9")}
              />
            </div>
          </label>

          <label className="block text-xs font-extrabold text-ink">
            المدينة
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className={cn(filterControlClass, "mt-1.5")}
            >
              <option value="all">كل المدن</option>
              {cities.map((city) => (
                <option value={city} key={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          {isVisitors ? (
            <label className="block text-xs font-extrabold text-ink">
              حالة الحضور
              <select
                value={attendanceFilter}
                onChange={(event) => setAttendanceFilter(event.target.value as AttendanceFilter)}
                className={cn(filterControlClass, "mt-1.5")}
              >
                <option value="all">الكل</option>
                <option value="present">{ATTENDANCE_PRESENT}</option>
                <option value="absent">{ATTENDANCE_ABSENT}</option>
              </select>
            </label>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-extrabold text-ink">
              من تاريخ
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className={cn(filterControlClass, "mt-1.5")}
              />
            </label>
            <label className="block text-xs font-extrabold text-ink">
              إلى تاريخ
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className={cn(filterControlClass, "mt-1.5")}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-muted">
            {filteredRecords.length} من {records.length} تسجيل
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-extrabold text-ink transition hover:bg-mist"
            >
              <X size={14} aria-hidden="true" />
              مسح الفلاتر
            </button>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-line bg-surface text-sm font-bold text-muted">
          <Loader2 size={22} className="animate-spin" aria-hidden="true" />
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    className="whitespace-nowrap border-b border-line bg-brand-600 px-3 py-3 text-center text-xs font-black text-white"
                    key={header}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((registration) => (
                <tr className="transition odd:bg-white even:bg-surface hover:bg-brand-50" key={registration.id}>
                  <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-center font-bold text-muted" dir="ltr">
                    {formatRegisteredAt(registration.registeredAt)}
                  </td>
                  <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-center font-black text-brand-700" dir="ltr">
                    {registration.registrationId}
                  </td>
                  <td className="border-b border-line px-3 py-2.5 text-center font-extrabold text-ink">
                    {registration.fullName}
                  </td>
                  <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-center font-bold text-ink" dir="ltr">
                    {registration.phone}
                  </td>
                  <td className="border-b border-line px-3 py-2.5 text-center font-bold text-ink">
                    {registration.jobTitle}
                  </td>
                  <td className="border-b border-line px-3 py-2.5 text-center font-bold text-ink" dir="ltr">
                    {registration.email}
                  </td>
                  <td className="border-b border-line px-3 py-2.5 text-center font-bold text-ink">
                    {registration.company}
                  </td>
                  <td className="border-b border-line px-3 py-2.5 text-center font-bold text-ink">
                    {registration.city}
                  </td>
                  {isVisitors ? (
                    <>
                      <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-center">
                        {registration.verifyUrl ? (
                          <a
                            href={registration.verifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-full border border-brand-600/30 bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700 transition hover:bg-brand-600 hover:text-white"
                          >
                            فتح الرابط
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-muted">-</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-3 py-1 text-xs font-black",
                            registration.attendanceStatus === ATTENDANCE_PRESENT
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : "bg-[#FEE2E2] text-[#991B1B]",
                          )}
                        >
                          {registration.attendanceStatus || ATTENDANCE_ABSENT}
                        </span>
                      </td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm font-bold text-muted">
          {records.length === 0
            ? isVisitors
              ? "لا توجد تسجيلات زوار حتى الآن."
              : "لا توجد تسجيلات عارضين حتى الآن."
            : "لا توجد نتائج مطابقة للفلاتر الحالية."}
        </div>
      )}
    </section>
  );
}
