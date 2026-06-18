"use client";

import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  Handshake,
  Image,
  Info,
  Layers,
  Link,
  ListChecks,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  RefreshCw,
  Save,
  Share2,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { defaultSiteContent, type SiteContent } from "@/data/site";
import { cn } from "@/components/ui/cn";

type PathPart = string | number;
type Path = PathPart[];
type FieldType = "text" | "textarea" | "url" | "number" | "password" | "checkbox" | "select";

type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  options?: Array<{ label: string; value: string }>;
};

type SiteDashboardProps = {
  initialContent: SiteContent;
  databaseConfigured: boolean;
  currentAdmin: CurrentAdmin;
  initialAdmins: AdminUser[];
};

type DraftRecord = Record<string, unknown>;
type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};
type CurrentAdmin = {
  id: string;
  email: string;
};
type AdminDrafts = Record<string, { email: string; password: string }>;

const sections = [
  { id: "metadata", label: "البيانات الأساسية", icon: FileText },
  { id: "links-assets", label: "الروابط والأصول", icon: Link },
  { id: "header", label: "الهيدر والتنقل", icon: Menu },
  { id: "hero", label: "الهيرو", icon: Image },
  { id: "event", label: "معلومات الحدث", icon: CalendarDays },
  { id: "about", label: "عن سيريدو", icon: Info },
  { id: "pillars", label: "المحاور", icon: ListChecks },
  { id: "tracks", label: "مسارات التسجيل", icon: Building2 },
  { id: "deep-about", label: "عن سيريدو الموسع", icon: Layers },
  { id: "ecosystem", label: "منظومة الأعمال", icon: Handshake },
  { id: "stats", label: "الإحصائيات", icon: BarChart3 },
  { id: "audience", label: "الجمهور", icon: UsersRound },
  { id: "sectors", label: "القطاعات", icon: Layers },
  { id: "partners", label: "الشركاء", icon: Handshake },
  { id: "final-cta", label: "النداء الأخير", icon: Megaphone },
  { id: "footer", label: "الفوتر", icon: FileText },
  { id: "social", label: "التواصل الاجتماعي", icon: Share2 },
  { id: "admins", label: "المدراء", icon: ShieldCheck },
] as const;

const linkLabels: Record<string, string> = {
  site: "رابط الموقع",
  exhibitorsPage: "صفحة العارضين",
  visitorsPage: "صفحة الزوار",
  sponsorsPage: "صفحة الرعايات",
  visitorRegistration: "رابط تسجيل الزائر",
  exhibitorRegistration: "رابط تسجيل العارض",
  profile: "رابط البروفايل",
  map: "رابط الخريطة",
  footerMap: "رابط خريطة الفوتر",
  whatsapp: "واتساب",
  privacy: "سياسة الخصوصية",
  email: "البريد الإلكتروني",
  phone: "الهاتف",
};

const assetLabels: Record<string, string> = {
  logo: "الشعار",
  heroVideo: "فيديو الهيرو",
  heroPoster: "غلاف الفيديو",
  aboutImage: "صورة عن سيريدو",
  networkImage: "صورة الشبكة/المعرض",
  venueLogo: "شعار القاعة",
  organizerLogo: "شعار المنظم",
};

const buttonVariantOptions = [
  { label: "أساسي", value: "primary" },
  { label: "مميز", value: "accent" },
  { label: "حدود", value: "outline" },
];

function buildAdminDrafts(admins: AdminUser[]): AdminDrafts {
  return Object.fromEntries(admins.map((admin) => [admin.id, { email: admin.email, password: "" }]));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is DraftRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readPath(root: unknown, path: Path): unknown {
  return path.reduce<unknown>((value, key) => {
    if (Array.isArray(value) && typeof key === "number") {
      return value[key];
    }

    if (isRecord(value)) {
      return value[key];
    }

    return undefined;
  }, root);
}

function writePath(root: SiteContent, path: Path, value: unknown): SiteContent {
  const next = clone(root) as DraftRecord;
  let cursor: unknown = next;

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];

    if (Array.isArray(cursor) && typeof key === "number") {
      cursor = cursor[key];
      continue;
    }

    if (isRecord(cursor)) {
      cursor = cursor[key];
    }
  }

  const last = path[path.length - 1];

  if (Array.isArray(cursor) && typeof last === "number") {
    cursor[last] = value;
  } else if (isRecord(cursor) && typeof last === "string") {
    cursor[last] = value;
  }

  return next as SiteContent;
}

function fieldValue(value: unknown) {
  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function normalizeFieldValue(type: FieldType, value: string | boolean) {
  if (type === "checkbox") {
    return Boolean(value);
  }

  if (type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return String(value);
}

function DashboardField({
  label,
  value,
  type = "text",
  options = [],
  onChange,
}: {
  label: string;
  value: unknown;
  type?: FieldType;
  options?: Array<{ label: string; value: string }>;
  onChange: (value: unknown) => void;
}) {
  const controlClass =
    "mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/10";

  if (type === "checkbox") {
    return (
      <label className="flex min-h-12 items-center justify-between gap-4 rounded-md border border-line bg-white px-3 py-2.5 text-sm font-bold text-ink shadow-sm">
        <span>{label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 accent-brand-600"
        />
      </label>
    );
  }

  if (type === "textarea") {
    return (
      <label className="block text-sm font-extrabold text-ink">
        {label}
        <textarea
          value={fieldValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={`${controlClass} min-h-28 resize-y leading-7`}
        />
      </label>
    );
  }

  if (type === "select") {
    return (
      <label className="block text-sm font-extrabold text-ink">
        {label}
        <select
          value={fieldValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className={controlClass}
        >
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block text-sm font-extrabold text-ink">
      {label}
      <input
        type={type === "number" ? "number" : type === "url" ? "url" : type === "password" ? "password" : "text"}
        value={fieldValue(value)}
        onChange={(event) => onChange(normalizeFieldValue(type, event.target.value))}
        className={controlClass}
      />
    </label>
  );
}

function EditorCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <h2 className="text-xl text-brand-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SiteDashboard({
  initialContent,
  databaseConfigured,
  currentAdmin,
  initialAdmins,
}: SiteDashboardProps) {
  const [draft, setDraft] = useState<SiteContent>(() => clone(initialContent));
  const [lastSaved, setLastSaved] = useState<SiteContent>(() => clone(initialContent));
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>("metadata");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("جاهز للتحرير.");
  const [messageType, setMessageType] = useState<"idle" | "success" | "error">("idle");
  const [currentAdminEmail, setCurrentAdminEmail] = useState(currentAdmin.email);
  const [admins, setAdmins] = useState<AdminUser[]>(() => clone(initialAdmins));
  const [adminDrafts, setAdminDrafts] = useState<AdminDrafts>(() => buildAdminDrafts(initialAdmins));
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminMessage, setAdminMessage] = useState("يمكن تعديل البريد أو تعيين كلمة سر جديدة لأي مدير.");
  const [adminMessageType, setAdminMessageType] = useState<"idle" | "success" | "error">("idle");
  const [isAdminSaving, setIsAdminSaving] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(lastSaved), [draft, lastSaved]);

  const getValue = <T,>(path: Path, fallback: T): T => {
    const value = readPath(draft, path);
    return value === undefined || value === null ? fallback : (value as T);
  };

  const updateValue = (path: Path, value: unknown) => {
    setDraft((current) => writePath(current, path, value));
  };

  const redirectToLogin = () => {
    window.location.href = "/admin-se?next=/dashboard";
  };

  const renderFields = (path: Path, fields: FieldDef[], columns = "md:grid-cols-2") => (
    <div className={`grid gap-4 ${columns}`}>
      {fields.map((field) => (
        <DashboardField
          key={field.key}
          label={field.label}
          type={field.type}
          options={field.options}
          value={getValue([...path, field.key], "")}
          onChange={(value) => updateValue([...path, field.key], value)}
        />
      ))}
    </div>
  );

  const renderRecordFields = (title: string, path: Path, labels: Record<string, string>) => {
    const record = getValue<Record<string, string>>(path, {});

    return (
      <EditorCard title={title}>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(record).map(([key, value]) => (
            <DashboardField
              key={key}
              label={labels[key] ?? key}
              type={key.toLowerCase().includes("email") || key === "phone" ? "text" : "url"}
              value={value}
              onChange={(nextValue) => updateValue([...path, key], nextValue)}
            />
          ))}
        </div>
      </EditorCard>
    );
  };

  const renderStringList = (title: string, path: Path, addLabel: string) => {
    const items = getValue<string[]>(path, []);

    return (
      <EditorCard
        title={title}
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-800"
            onClick={() => updateValue(path, [...items, ""])}
          >
            <Plus size={16} aria-hidden="true" />
            {addLabel}
          </button>
        }
      >
        <div className="grid gap-3">
          {items.map((item, index) => (
            <div className="grid gap-3 rounded-lg border border-line bg-surface p-3 md:grid-cols-[1fr_auto]" key={`${path.join(".")}-${index}`}>
              <DashboardField
                label={`${addLabel} ${index + 1}`}
                value={item}
                onChange={(value) => updateValue([...path, index], value)}
              />
              <button
                type="button"
                className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                onClick={() => updateValue(path, items.filter((_, itemIndex) => itemIndex !== index))}
                aria-label="حذف"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </EditorCard>
    );
  };

  const renderObjectList = (
    title: string,
    path: Path,
    fields: FieldDef[],
    createItem: () => DraftRecord,
    addLabel = "إضافة عنصر",
  ) => {
    const items = getValue<DraftRecord[]>(path, []);

    return (
      <EditorCard
        title={title}
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-800"
            onClick={() => updateValue(path, [...items, createItem()])}
          >
            <Plus size={16} aria-hidden="true" />
            {addLabel}
          </button>
        }
      >
        <div className="grid gap-4">
          {items.map((item, index) => (
            <article className="rounded-lg border border-line bg-surface p-4" key={`${path.join(".")}-${index}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base text-brand-800">#{index + 1}</h3>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                  onClick={() => updateValue(path, items.filter((_, itemIndex) => itemIndex !== index))}
                  aria-label="حذف"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <DashboardField
                    key={field.key}
                    label={field.label}
                    type={field.type}
                    options={field.options}
                    value={item[field.key]}
                    onChange={(value) => updateValue([...path, index, field.key], value)}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </EditorCard>
    );
  };

  const loadLatest = async () => {
    setIsLoading(true);
    setMessage("جاري تحميل آخر نسخة...");
    setMessageType("idle");

    try {
      const response = await fetch("/api/admin/site-content", { cache: "no-store" });
      const payload = (await response.json()) as { content: SiteContent; message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message ?? "تعذر تحميل المحتوى.");
      }

      setDraft(clone(payload.content));
      setLastSaved(clone(payload.content));
      setMessage("تم تحميل آخر نسخة.");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحميل المحتوى.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    setIsSaving(true);
    setMessage("جاري الحفظ...");
    setMessageType("idle");

    try {
      const response = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: draft }),
      });
      const payload = (await response.json()) as { content?: SiteContent; message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !payload.content) {
        throw new Error(payload.message ?? "تعذر حفظ المحتوى.");
      }

      setDraft(clone(payload.content));
      setLastSaved(clone(payload.content));
      setMessage(payload.message ?? "تم الحفظ.");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ المحتوى.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  const resetDraft = () => {
    setDraft(clone(lastSaved));
    setMessage("تم إلغاء التعديلات غير المحفوظة.");
    setMessageType("idle");
  };

  const restoreDefaults = () => {
    setDraft(clone(defaultSiteContent));
    setMessage("تم وضع المحتوى الافتراضي كمسودة.");
    setMessageType("idle");
  };

  const refreshAdmins = async () => {
    setIsAdminSaving(true);
    setAdminMessage("جاري تحميل المدراء...");
    setAdminMessageType("idle");

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json()) as { admins?: AdminUser[]; message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !payload.admins) {
        throw new Error(payload.message ?? "تعذر تحميل المدراء.");
      }

      setAdmins(payload.admins);
      setAdminDrafts(buildAdminDrafts(payload.admins));
      setAdminMessage("تم تحميل قائمة المدراء.");
      setAdminMessageType("success");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "تعذر تحميل المدراء.");
      setAdminMessageType("error");
    } finally {
      setIsAdminSaving(false);
    }
  };

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAdminSaving(true);
    setAdminMessage("جاري إضافة المدير...");
    setAdminMessageType("idle");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
      });
      const payload = (await response.json()) as { admins?: AdminUser[]; message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !payload.admins) {
        throw new Error(payload.message ?? "تعذرت إضافة المدير.");
      }

      setAdmins(payload.admins);
      setAdminDrafts(buildAdminDrafts(payload.admins));
      setNewAdminEmail("");
      setNewAdminPassword("");
      setAdminMessage(payload.message ?? "تمت إضافة المدير.");
      setAdminMessageType("success");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "تعذرت إضافة المدير.");
      setAdminMessageType("error");
    } finally {
      setIsAdminSaving(false);
    }
  };

  const updateAdmin = async (adminId: string) => {
    const adminDraft = adminDrafts[adminId];

    if (!adminDraft) {
      return;
    }

    setIsAdminSaving(true);
    setAdminMessage("جاري تحديث بيانات المدير...");
    setAdminMessageType("idle");

    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: adminDraft.email,
          password: adminDraft.password || undefined,
        }),
      });
      const payload = (await response.json()) as { admin?: AdminUser; admins?: AdminUser[]; message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !payload.admins) {
        throw new Error(payload.message ?? "تعذر تحديث المدير.");
      }

      setAdmins(payload.admins);
      setAdminDrafts(buildAdminDrafts(payload.admins));

      if (payload.admin?.id === currentAdmin.id) {
        setCurrentAdminEmail(payload.admin.email);
      }

      setAdminMessage(payload.message ?? "تم تحديث المدير.");
      setAdminMessageType("success");
    } catch (error) {
      setAdminMessage(error instanceof Error ? error.message : "تعذر تحديث المدير.");
      setAdminMessageType("error");
    } finally {
      setIsAdminSaving(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin-se";
  };

  const renderPartnerGroup = (
    key: "government" | "finance" | "exhibitors" | "media",
    title: string,
  ) => (
    <div className="grid gap-4">
      <EditorCard title={title}>
        {renderFields(["partnersSection", "groups", key], [
          { key: "title", label: "عنوان المجموعة" },
          { key: "countLabel", label: "وسم العدد" },
        ])}
      </EditorCard>
      {renderObjectList(
        `${title} - الشعارات`,
        ["partnersSection", "groups", key, "items"],
        [
          { key: "name", label: "اسم الجهة" },
          { key: "logo", label: "مسار الشعار", type: "url" },
        ],
        () => ({ name: "", logo: "" }),
        "إضافة شعار",
      )}
    </div>
  );

  const activeContent = () => {
    switch (activeSection) {
      case "metadata":
        return (
          <EditorCard title="البيانات الأساسية">
            {renderFields(
              ["metadata"],
              [
                { key: "title", label: "عنوان الصفحة" },
                { key: "description", label: "وصف الصفحة", type: "textarea" },
                { key: "openGraphTitle", label: "عنوان المشاركة" },
                { key: "openGraphDescription", label: "وصف المشاركة", type: "textarea" },
              ],
              "md:grid-cols-1",
            )}
          </EditorCard>
        );

      case "links-assets":
        return (
          <div className="grid gap-5">
            {renderRecordFields("الروابط", ["links"], linkLabels)}
            {renderRecordFields("الأصول والصور", ["assets"], assetLabels)}
          </div>
        );

      case "header":
        return (
          <div className="grid gap-5">
            <EditorCard title="الهيدر">
              {renderFields(["header"], [
                { key: "logoAlt", label: "نص بديل للشعار" },
                { key: "fallbackLogoText", label: "نص الشعار البديل" },
                { key: "menuOpenLabel", label: "نص فتح القائمة" },
                { key: "menuCloseLabel", label: "نص إغلاق القائمة" },
                { key: "visitorButton", label: "زر الزائر" },
                { key: "exhibitorButton", label: "زر العارض" },
              ])}
            </EditorCard>
            {renderObjectList(
              "روابط القائمة",
              ["header", "navItems"],
              [
                { key: "label", label: "النص" },
                { key: "href", label: "الرابط", type: "url" },
              ],
              () => ({ label: "", href: "" }),
              "إضافة رابط",
            )}
          </div>
        );

      case "hero":
        return (
          <div className="grid gap-5">
            <EditorCard title="الهيرو">
              {renderFields(
                ["hero"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "subtitle", label: "الوصف", type: "textarea" },
                  { key: "imageAlt", label: "النص البديل للصورة" },
                  { key: "figureTitle", label: "عنوان الصورة" },
                  { key: "figureDescription", label: "وصف الصورة", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderStringList("نقاط الهيرو", ["hero", "highlights"], "نقطة")}
            <EditorCard title="أزرار الهيرو">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-lg border border-line bg-surface p-4">
                  {renderFields(["hero", "primaryButton"], [
                    { key: "label", label: "نص الزر الأساسي" },
                    { key: "href", label: "رابط الزر الأساسي", type: "url" },
                  ])}
                </div>
                <div className="rounded-lg border border-line bg-surface p-4">
                  {renderFields(["hero", "secondaryButton"], [
                    { key: "label", label: "نص الزر الثاني" },
                    { key: "href", label: "رابط الزر الثاني", type: "url" },
                  ])}
                </div>
              </div>
            </EditorCard>
            <EditorCard title="العد التنازلي">
              {renderFields(["hero", "countdown"], [
                { key: "targetDate", label: "تاريخ ووقت الانطلاق" },
                { key: "title", label: "عنوان العداد" },
                { key: "location", label: "الموقع" },
                { key: "daysLabel", label: "تسمية الأيام" },
                { key: "hoursLabel", label: "تسمية الساعات" },
                { key: "minutesLabel", label: "تسمية الدقائق" },
                { key: "secondsLabel", label: "تسمية الثواني" },
              ])}
            </EditorCard>
          </div>
        );

      case "event":
        return renderObjectList(
          "معلومات الحدث",
          ["eventInfo", "items"],
          [
            { key: "label", label: "العنوان" },
            { key: "value", label: "القيمة" },
            { key: "href", label: "الرابط", type: "url" },
          ],
          () => ({ label: "", value: "", href: "" }),
          "إضافة معلومة",
        );

      case "about":
        return (
          <div className="grid gap-5">
            <EditorCard title="عن سيريدو">
              {renderFields(
                ["about"],
                [
                  { key: "eyebrow", label: "الوسم" },
                  { key: "title", label: "العنوان" },
                  { key: "buttonLabel", label: "نص الزر" },
                  { key: "buttonHref", label: "رابط الزر", type: "url" },
                  { key: "imageAlt", label: "النص البديل للصورة" },
                  { key: "figureTitle", label: "عنوان الصورة" },
                  { key: "figureCaption", label: "وصف الصورة" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderStringList("فقرات عن سيريدو", ["about", "paragraphs"], "فقرة")}
          </div>
        );

      case "pillars":
        return (
          <div className="grid gap-5">
            <EditorCard title="عنوان المحاور">
              {renderFields(["pillarsSection"], [{ key: "title", label: "العنوان" }], "md:grid-cols-1")}
            </EditorCard>
            {renderStringList("قائمة المحاور", ["pillarsSection", "items"], "محور")}
          </div>
        );

      case "tracks":
        return (
          <div className="grid gap-5">
            <EditorCard title="مسارات التسجيل">
              {renderFields(
                ["tracksSection"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "بطاقات التسجيل",
              ["tracksSection", "items"],
              [
                { key: "title", label: "العنوان" },
                { key: "description", label: "الوصف", type: "textarea" },
                { key: "href", label: "الرابط", type: "url" },
                { key: "action", label: "نص الرابط" },
              ],
              () => ({ title: "", description: "", href: "", action: "" }),
              "إضافة بطاقة",
            )}
          </div>
        );

      case "deep-about":
        return (
          <div className="grid gap-5">
            <EditorCard title="عن سيريدو الموسع">
              {renderFields(
                ["deepAboutSection"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "intro", label: "المقدمة", type: "textarea" },
                  { key: "subheading", label: "العنوان الفرعي" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderStringList("الفقرات", ["deepAboutSection", "paragraphs"], "فقرة")}
            {renderObjectList(
              "بطاقات جانبية",
              ["deepAboutSection", "sideStats"],
              [
                { key: "value", label: "القيمة" },
                { key: "label", label: "الوصف", type: "textarea" },
                { key: "dark", label: "خلفية داكنة", type: "checkbox" },
              ],
              () => ({ value: "", label: "", dark: false }),
              "إضافة بطاقة",
            )}
          </div>
        );

      case "ecosystem":
        return (
          <div className="grid gap-5">
            <EditorCard title="منظومة الأعمال">
              {renderFields(
                ["ecosystemSection"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                  { key: "imageAlt", label: "النص البديل للصورة" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "بطاقات المنظومة",
              ["ecosystemSection", "cards"],
              [
                { key: "title", label: "العنوان" },
                { key: "description", label: "الوصف", type: "textarea" },
                { key: "featured", label: "بطاقة مميزة", type: "checkbox" },
              ],
              () => ({ title: "", description: "", featured: false }),
              "إضافة بطاقة",
            )}
          </div>
        );

      case "stats":
        return (
          <div className="grid gap-5">
            <EditorCard title="الإحصائيات">
              {renderFields(["statsSection"], [
                { key: "eyebrow", label: "الوسم" },
                { key: "title", label: "العنوان" },
              ])}
            </EditorCard>
            {renderObjectList(
              "أرقام سيريدو",
              ["statsSection", "items"],
              [
                { key: "value", label: "الرقم", type: "number" },
                { key: "decimals", label: "الخانات العشرية", type: "number" },
                { key: "suffix", label: "اللاحقة" },
                { key: "label", label: "الوصف", type: "textarea" },
              ],
              () => ({ value: 0, decimals: 0, suffix: "", label: "" }),
              "إضافة رقم",
            )}
          </div>
        );

      case "audience":
        return (
          <div className="grid gap-5">
            <EditorCard title="الجمهور">
              {renderFields(["audienceSection"], [{ key: "title", label: "العنوان" }], "md:grid-cols-1")}
            </EditorCard>
            {renderObjectList(
              "فئات الجمهور",
              ["audienceSection", "items"],
              [
                { key: "title", label: "العنوان" },
                { key: "description", label: "الوصف", type: "textarea" },
              ],
              () => ({ title: "", description: "" }),
              "إضافة فئة",
            )}
          </div>
        );

      case "sectors":
        return (
          <div className="grid gap-5">
            <EditorCard title="القطاعات">
              {renderFields(
                ["sectorsSection"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderStringList("قائمة القطاعات", ["sectorsSection", "items"], "قطاع")}
          </div>
        );

      case "partners":
        return (
          <div className="grid gap-5">
            <EditorCard title="الشركاء">
              {renderFields(
                ["partnersSection"],
                [
                  { key: "eyebrow", label: "الوسم" },
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderPartnerGroup("government", "الجهات الحكومية")}
            {renderPartnerGroup("finance", "البنوك وشركات التمويل")}
            {renderPartnerGroup("exhibitors", "العارضون")}
            {renderPartnerGroup("media", "الشركاء الإعلاميون")}
          </div>
        );

      case "final-cta":
        return (
          <div className="grid gap-5">
            <EditorCard title="النداء الأخير">
              {renderFields(
                ["finalCta"],
                [
                  { key: "eyebrow", label: "الوسم" },
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "أزرار النداء الأخير",
              ["finalCta", "buttons"],
              [
                { key: "label", label: "نص الزر" },
                { key: "href", label: "الرابط", type: "url" },
                { key: "variant", label: "النمط", type: "select", options: buttonVariantOptions },
              ],
              () => ({ label: "", href: "", variant: "primary" }),
              "إضافة زر",
            )}
          </div>
        );

      case "footer":
        return (
          <div className="grid gap-5">
            <EditorCard title="الفوتر">
              {renderFields(
                ["footer"],
                [
                  { key: "logoAlt", label: "النص البديل للشعار" },
                  { key: "description", label: "الوصف", type: "textarea" },
                  { key: "followTitle", label: "عنوان المتابعة" },
                  { key: "socialLabel", label: "وصف روابط التواصل" },
                  { key: "venueLogoAlt", label: "النص البديل لشعار القاعة" },
                  { key: "organizerLogoAlt", label: "النص البديل لشعار المنظم" },
                  { key: "contactTitle", label: "عنوان التواصل" },
                  { key: "eventTitle", label: "عنوان الحدث" },
                  { key: "linksTitle", label: "عنوان الروابط" },
                  { key: "backToTopLabel", label: "زر العودة للأعلى" },
                  { key: "copyright", label: "حقوق النشر" },
                ],
                "md:grid-cols-2",
              )}
            </EditorCard>
            {renderObjectList(
              "بيانات التواصل",
              ["footer", "contactItems"],
              [
                { key: "label", label: "العنوان" },
                { key: "value", label: "القيمة" },
                { key: "href", label: "الرابط", type: "url" },
              ],
              () => ({ label: "", value: "", href: "" }),
              "إضافة وسيلة",
            )}
            {renderObjectList(
              "بيانات الحدث",
              ["footer", "eventItems"],
              [
                { key: "label", label: "العنوان" },
                { key: "value", label: "القيمة" },
              ],
              () => ({ label: "", value: "" }),
              "إضافة معلومة",
            )}
            {renderObjectList(
              "روابط الفوتر",
              ["footer", "navLinks"],
              [
                { key: "label", label: "النص" },
                { key: "href", label: "الرابط", type: "url" },
              ],
              () => ({ label: "", href: "" }),
              "إضافة رابط",
            )}
          </div>
        );

      case "social":
        return renderObjectList(
          "روابط التواصل الاجتماعي",
          ["socialLinks"],
          [
            { key: "label", label: "المنصة" },
            { key: "href", label: "الرابط", type: "url" },
            { key: "short", label: "الاختصار" },
          ],
          () => ({ label: "", href: "", short: "" }),
          "إضافة منصة",
        );

      case "admins":
        return (
          <div className="grid gap-5">
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold",
                adminMessageType === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                adminMessageType === "error" && "border-red-200 bg-red-50 text-red-700",
                adminMessageType === "idle" && "border-line bg-white text-muted",
              )}
            >
              {adminMessageType === "success" ? (
                <CheckCircle2 size={18} aria-hidden="true" />
              ) : adminMessageType === "error" ? (
                <AlertCircle size={18} aria-hidden="true" />
              ) : (
                <Info size={18} aria-hidden="true" />
              )}
              <span>{adminMessage}</span>
            </div>

            <EditorCard title="إضافة مدير جديد">
              <form onSubmit={createAdmin} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <DashboardField
                  label="البريد الإلكتروني"
                  type="text"
                  value={newAdminEmail}
                  onChange={(value) => setNewAdminEmail(String(value))}
                />
                <DashboardField
                  label="كلمة السر"
                  type="password"
                  value={newAdminPassword}
                  onChange={(value) => setNewAdminPassword(String(value))}
                />
                <button
                  type="submit"
                  disabled={isAdminSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-5 py-2 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAdminSaving ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
                  إضافة
                </button>
              </form>
            </EditorCard>

            <EditorCard
              title="المدراء الحاليون"
              action={
                <button
                  type="button"
                  onClick={refreshAdmins}
                  disabled={isAdminSaving}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAdminSaving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}
                  تحديث
                </button>
              }
            >
              <div className="grid gap-4">
                {admins.map((admin) => {
                  const adminDraft = adminDrafts[admin.id] ?? { email: admin.email, password: "" };
                  const isCurrentAdmin = admin.id === currentAdmin.id;

                  return (
                    <article className="rounded-lg border border-line bg-surface p-4" key={admin.id}>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg text-brand-800">{admin.email}</h3>
                          <p className="text-xs font-bold text-muted">
                            آخر تحديث: {new Date(admin.updatedAt).toLocaleString("ar-SA")}
                          </p>
                        </div>
                        {isCurrentAdmin ? (
                          <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-black text-white">
                            حسابك الحالي
                          </span>
                        ) : null}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <DashboardField
                          label="البريد الإلكتروني"
                          value={adminDraft.email}
                          onChange={(value) =>
                            setAdminDrafts((current) => ({
                              ...current,
                              [admin.id]: {
                                ...adminDraft,
                                email: String(value),
                              },
                            }))
                          }
                        />
                        <DashboardField
                          label="كلمة سر جديدة"
                          type="password"
                          value={adminDraft.password}
                          onChange={(value) =>
                            setAdminDrafts((current) => ({
                              ...current,
                              [admin.id]: {
                                ...adminDraft,
                                password: String(value),
                              },
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => updateAdmin(admin.id)}
                          disabled={isAdminSaving}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-5 py-2 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isAdminSaving ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
                          حفظ
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </EditorCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-[min(1460px,calc(100%-28px))] flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-600/15 bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
              <Database size={14} aria-hidden="true" />
              {databaseConfigured ? "Postgres متصل" : "DATABASE_URL غير مضبوط"}
            </p>
            <h1 className="mt-3 text-2xl text-brand-900 sm:text-3xl">لوحة تحرير محتوى سيريدو</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink">
              <ShieldCheck size={17} className="text-brand-600" aria-hidden="true" />
              {currentAdminEmail}
            </span>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist"
            >
              <Eye size={17} aria-hidden="true" />
              معاينة
            </a>
            <button
              type="button"
              onClick={loadLatest}
              disabled={isLoading || isSaving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={17} aria-hidden="true" />}
              تحديث
            </button>
            <button
              type="button"
              onClick={resetDraft}
              disabled={!isDirty || isSaving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} aria-hidden="true" />
              إلغاء
            </button>
            <button
              type="button"
              onClick={restoreDefaults}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} aria-hidden="true" />
              الافتراضي
            </button>
            <button
              type="button"
              onClick={saveContent}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-600 px-5 py-2 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
              حفظ
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-50"
            >
              <LogOut size={17} aria-hidden="true" />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-[min(1460px,calc(100%-28px))] flex-col gap-5 py-6 lg:flex-row-reverse lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-5 lg:w-72">
          <nav className="rounded-lg border border-line bg-white p-2 shadow-soft" aria-label="أقسام الداشبورد">
            <div className="grid gap-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-right text-sm font-extrabold transition",
                      isActive ? "bg-brand-600 text-white shadow-sm" : "text-ink hover:bg-mist",
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={18} aria-hidden="true" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div
            className={cn(
              "mb-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold",
              messageType === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
              messageType === "error" && "border-red-200 bg-red-50 text-red-700",
              messageType === "idle" && "border-line bg-white text-muted",
            )}
          >
            {messageType === "success" ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : messageType === "error" ? (
              <AlertCircle size={18} aria-hidden="true" />
            ) : (
              <Info size={18} aria-hidden="true" />
            )}
            <span>{message}</span>
            {isDirty ? <span className="me-auto rounded-full bg-copper-500 px-3 py-1 text-xs font-black text-white">تعديلات غير محفوظة</span> : null}
          </div>

          {activeContent()}
        </main>
      </div>
    </div>
  );
}
