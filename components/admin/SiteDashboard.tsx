"use client";

import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Crown,
  Eye,
  FileText,
  Gem,
  Globe,
  Handshake,
  Home,
  Image,
  ImagePlus,
  IdCard,
  Info,
  Layers,
  Link,
  ListChecks,
  Loader2,
  LogOut,
  MailOpen,
  Medal,
  Megaphone,
  Menu,
  MessageSquare,
  Newspaper,
  Plus,
  RefreshCw,
  Save,
  Share2,
  ShieldCheck,
  Star,
  Store,
  Settings,
  Ticket,
  Trash2,
  Upload,
  UserRoundCheck,
  Video,
  X,
  type LucideIcon,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { type SiteContent } from "@/data/site";
import { cn } from "@/components/ui/cn";

type PathPart = string | number;
type Path = PathPart[];
type FieldType = "text" | "textarea" | "url" | "number" | "password" | "checkbox" | "select" | "icon" | "image" | "video";

type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  options?: Array<{ label: string; value: string }>;
};

type SiteDashboardProps = {
  initialContent: SiteContent;
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
type GalleryImage = {
  src: string;
  name: string;
  origin: "assets" | "uploads";
  deletable: boolean;
  mediaType: "image" | "video";
  size?: number;
  updatedAt?: string;
};
type GalleryTarget = {
  value: string;
  onSelect: (src: string) => void;
} | null;

const sections = [
  { id: "general", label: "إعدادات عامة", icon: Settings },
  { id: "gallery", label: "المعرض", icon: ImagePlus },
  { id: "hero", label: "فيديو الهيرو", icon: Video },
  { id: "partners", label: "الشركاء", icon: Handshake },
  { id: "footer", label: "الفوتر", icon: FileText },
  { id: "admins", label: "المدراء", icon: ShieldCheck },
] as const;

type SectionId = string;
type DashboardGroupId = "main" | "pages" | "settings";

const dashboardGroups: Array<{
  id: DashboardGroupId;
  label: string;
  icon: LucideIcon;
  sectionIds: SectionId[];
}> = [
  {
    id: "settings",
    label: "الإعدادات العامة",
    icon: Settings,
    sectionIds: ["general", "gallery", "hero", "partners", "footer", "admins"],
  },
];

const sectionsById = Object.fromEntries(sections.map((section) => [section.id, section])) as Record<
  string,
  (typeof sections)[number]
>;

const linkLabels: Record<string, string> = {
  site: "رابط الموقع",
  exhibitorsPage: "صفحة العارضين",
  visitorsPage: "صفحة الزوار",
  sponsorsPage: "صفحة الرعايات",
  mediaPage: "المركز الإعلامي",
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

const sponsorIconOptions = [
  { label: "كرة أرضية", value: "globe" },
  { label: "تسويق", value: "megaphone" },
  { label: "بريد", value: "mail" },
  { label: "مشاركة", value: "share" },
  { label: "بطاقة", value: "id-card" },
  { label: "جناح", value: "store" },
  { label: "VIP", value: "vip" },
  { label: "تذاكر", value: "ticket" },
  { label: "دليل", value: "book" },
  { label: "فيديو", value: "video" },
  { label: "درع", value: "award" },
  { label: "تقرير", value: "chart" },
  { label: "نجمة", value: "star" },
  { label: "ميدالية", value: "medal" },
  { label: "ماسة", value: "gem" },
  { label: "تاج", value: "crown" },
  { label: "رسالة", value: "message" },
  { label: "سهم", value: "arrow" },
];

const sponsorIconMap: Record<string, LucideIcon> = {
  globe: Globe,
  megaphone: Megaphone,
  mail: MailOpen,
  share: Share2,
  "id-card": IdCard,
  store: Store,
  vip: UserRoundCheck,
  ticket: Ticket,
  book: BookOpen,
  video: Video,
  award: Award,
  chart: BarChart3,
  star: Star,
  medal: Medal,
  gem: Gem,
  crown: Crown,
  message: MessageSquare,
  arrow: ArrowLeft,
};

const socialPlatforms = [
  {
    label: "TikTok",
    short: "TT",
    valueLabel: "اسم مستخدم TikTok",
    placeholder: "seredoexpoksa",
    hrefPrefix: "https://www.tiktok.com/@",
    trailingSlash: false,
  },
  {
    label: "LinkedIn",
    short: "in",
    valueLabel: "معرّف صفحة LinkedIn",
    placeholder: "seredoexpo26",
    hrefPrefix: "https://www.linkedin.com/company/",
    trailingSlash: true,
  },
  {
    label: "Instagram",
    short: "IG",
    valueLabel: "اسم مستخدم Instagram",
    placeholder: "seredoexpoksa",
    hrefPrefix: "https://www.instagram.com/",
    trailingSlash: false,
  },
  {
    label: "X",
    short: "X",
    valueLabel: "اسم مستخدم X",
    placeholder: "seredoexposa",
    hrefPrefix: "https://x.com/",
    trailingSlash: false,
  },
  {
    label: "YouTube",
    short: "YT",
    valueLabel: "معرّف قناة YouTube",
    placeholder: "seredoexposa",
    hrefPrefix: "https://www.youtube.com/@",
    trailingSlash: false,
  },
] as const;

type SocialPlatform = (typeof socialPlatforms)[number];
type SocialLink = SiteContent["socialLinks"][number];

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

function showSaveToast(title = "تم الحفظ بنجاح") {
  void Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#ecfdf5",
    color: "#065f46",
  });
}

async function confirmDelete(title = "تأكيد الحذف") {
  const result = await Swal.fire({
    title,
    text: "لا يمكن التراجع عن هذا الإجراء بعد الحفظ.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "حذف",
    cancelButtonText: "إلغاء",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}

function findSocialPlatform(label: string) {
  const normalized = label.trim().toLowerCase();

  return socialPlatforms.find((platform) => platform.label.toLowerCase() === normalized);
}

function buildSocialHref(platform: SocialPlatform, rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const handle = value.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  const suffix = platform.trailingSlash ? "/" : "";

  return `${platform.hrefPrefix}${encodeURI(handle)}${suffix}`;
}

function socialValueFromHref(platform: SocialPlatform, href: string) {
  const value = href.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith(platform.hrefPrefix)) {
    return decodeURI(value.slice(platform.hrefPrefix.length).replace(/\/+$/g, ""));
  }

  return value;
}

function normalizeSocialLinks(links: SocialLink[]) {
  const used = new Set<string>();
  const normalized: SocialLink[] = [];

  for (const link of links) {
    const platform = findSocialPlatform(link.label);

    if (!platform || used.has(platform.label)) {
      continue;
    }

    used.add(platform.label);
    normalized.push({
      label: platform.label,
      short: platform.short,
      href: link.href ?? "",
    });
  }

  return normalized;
}

const imageAssetKeys = new Set(["logo", "heroPoster", "aboutImage", "networkImage", "venueLogo", "organizerLogo"]);
const imageObjectKeys = new Set(["logo", "image"]);

function isImageAssetKey(key: string) {
  return imageAssetKeys.has(key);
}

function isImageObjectField(field: FieldDef) {
  return field.type === "image" || imageObjectKeys.has(field.key);
}

function dedupeGalleryImages(images: GalleryImage[]) {
  const seen = new Set<string>();

  return images.filter((image) => {
    if (seen.has(image.src)) {
      return false;
    }

    seen.add(image.src);
    return true;
  });
}

function formatFileSize(size?: number) {
  if (!size || !Number.isFinite(size)) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function sanitizeSiteContent(content: SiteContent) {
  const next = clone(content);
  next.socialLinks = normalizeSocialLinks(next.socialLinks);

  return next;
}

function DashboardIconPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: unknown;
  options: Array<{ label: string; value: string }>;
  onChange: (value: unknown) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedValue = fieldValue(value) || options[0]?.value || "";
  const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];
  const SelectedIcon = sponsorIconMap[selectedOption?.value ?? ""] ?? BriefcaseBusiness;

  return (
    <div className="relative block text-sm font-extrabold text-ink">
      <span>{label}</span>
      <button
        type="button"
        aria-label={`${label}: ${selectedOption?.label ?? selectedValue}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="mt-2 flex h-[50px] w-full items-center justify-center rounded-md border border-line bg-white px-3 text-brand-700 shadow-sm transition hover:border-brand-600/40 hover:bg-brand-50 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/10"
      >
        <SelectedIcon size={24} strokeWidth={2.4} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-lg border border-line bg-white p-3 shadow-strong">
          <div className="grid grid-cols-6 gap-2">
            {options.map((option) => {
              const Icon = sponsorIconMap[option.value] ?? BriefcaseBusiness;
              const isSelected = option.value === selectedValue;

              return (
                <button
                  type="button"
                  key={option.value}
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex h-11 w-full items-center justify-center rounded-md border transition",
                    isSelected
                      ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                      : "border-line bg-surface text-brand-700 hover:border-brand-600/40 hover:bg-brand-50",
                  )}
                >
                  <Icon size={21} strokeWidth={2.35} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DashboardImageField({
  label,
  value,
  onChange,
  onOpenGallery,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onOpenGallery?: (value: string, onSelect: (src: string) => void) => void;
}) {
  const src = fieldValue(value);

  return (
    <div className="block text-sm font-extrabold text-ink">
      <span>{label}</span>
      <div className="mt-2 rounded-md border border-line bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-mist">
            {src ? (
              <img src={src} alt="" className="h-full w-full object-contain" />
            ) : (
              <Image size={26} className="text-muted" aria-hidden="true" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-muted">{src || "لم يتم اختيار صورة"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenGallery?.(src, (nextSrc) => onChange(nextSrc))}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-brand-800"
              >
                <ImagePlus size={15} aria-hidden="true" />
                المعرض
              </button>
              {src ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-muted transition hover:bg-mist hover:text-ink"
                  aria-label={`إزالة ${label}`}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardVideoField({
  label,
  value,
  onChange,
  onOpenGallery,
}: {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  onOpenGallery?: (value: string, onSelect: (src: string) => void) => void;
}) {
  const src = fieldValue(value);

  return (
    <div className="block text-sm font-extrabold text-ink">
      <span>{label}</span>
      <div className="mt-2 rounded-md border border-line bg-white p-3 shadow-sm">
        <div className="grid gap-3">
          <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-line bg-brand-900">
            {src ? (
              <video src={src} className="h-full w-full object-contain" controls muted playsInline />
            ) : (
              <Video size={28} className="text-white/70" aria-hidden="true" />
            )}
          </div>
          <p className="truncate text-xs font-bold text-muted">{src || "لم يتم اختيار فيديو"}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenGallery?.(src, (nextSrc) => onChange(nextSrc))}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-brand-800"
            >
              <ImagePlus size={15} aria-hidden="true" />
              اختيار من المعرض
            </button>
            {src ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-muted transition hover:bg-mist hover:text-ink"
                aria-label={`إزالة ${label}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardField({
  label,
  value,
  type = "text",
  options = [],
  onChange,
  onOpenGallery,
}: {
  label: string;
  value: unknown;
  type?: FieldType;
  options?: Array<{ label: string; value: string }>;
  onChange: (value: unknown) => void;
  onOpenGallery?: (value: string, onSelect: (src: string) => void) => void;
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

  if (type === "icon") {
    return <DashboardIconPicker label={label} value={value} options={options} onChange={onChange} />;
  }

  if (type === "image") {
    return <DashboardImageField label={label} value={value} onChange={onChange} onOpenGallery={onOpenGallery} />;
  }

  if (type === "video") {
    return <DashboardVideoField label={label} value={value} onChange={onChange} onOpenGallery={onOpenGallery} />;
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
  currentAdmin,
  initialAdmins,
}: SiteDashboardProps) {
  const [draft, setDraft] = useState<SiteContent>(() => clone(initialContent));
  const [lastSaved, setLastSaved] = useState<SiteContent>(() => clone(initialContent));
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [openGroups, setOpenGroups] = useState<Record<DashboardGroupId, boolean>>({
    main: true,
    pages: false,
    settings: false,
  });
  const [isSaving, setIsSaving] = useState(false);
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
  const [socialPlatformToAdd, setSocialPlatformToAdd] = useState<string>(socialPlatforms[0].label);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<GalleryTarget>(null);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(lastSaved), [draft, lastSaved]);

  const getValue = <T,>(path: Path, fallback: T): T => {
    const value = readPath(draft, path);
    return value === undefined || value === null ? fallback : (value as T);
  };

  const updateValue = (path: Path, value: unknown) => {
    setDraft((current) => writePath(current, path, value));
  };

  const toggleDashboardGroup = (groupId: DashboardGroupId) => {
    setOpenGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  const activateSection = (sectionId: SectionId, groupId: DashboardGroupId) => {
    setActiveSection(sectionId);
    setOpenGroups((current) => ({
      ...current,
      [groupId]: true,
    }));
  };

  const redirectToLogin = () => {
    window.location.href = "/admin-se?next=/dashboard";
  };

  const loadGalleryImages = async () => {
    setIsGalleryLoading(true);

    try {
      const response = await fetch("/api/admin/gallery", { cache: "no-store" });
      const payload = (await response.json()) as { images?: GalleryImage[]; message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !payload.images) {
        throw new Error(payload.message ?? "تعذر تحميل معرض الصور.");
      }

      setGalleryImages(dedupeGalleryImages(payload.images));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحميل معرض الصور.");
      setMessageType("error");
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const openGalleryModal = (value: string, onSelect: (src: string) => void) => {
    setGalleryTarget({ value, onSelect });
    setIsGalleryOpen(true);
    void loadGalleryImages();
  };

  const closeGalleryModal = () => {
    setIsGalleryOpen(false);
    setGalleryTarget(null);
  };

  const uploadGalleryFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files);

    if (selectedFiles.length === 0) {
      return;
    }

    setIsGalleryUploading(true);

    try {
      const uploadedImages: GalleryImage[] = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/gallery", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as { image?: GalleryImage; message?: string };

        if (response.status === 401) {
          redirectToLogin();
          return;
        }

        if (!response.ok || !payload.image) {
          throw new Error(payload.message ?? "تعذر رفع الملف.");
        }

        uploadedImages.push(payload.image);
      }

      setGalleryImages((current) => dedupeGalleryImages([...uploadedImages, ...current]));
      showSaveToast(uploadedImages.length > 1 ? "تم رفع الملفات" : "تم رفع الملف");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "تعذر رفع الملف.";
      setMessage(errorMessage);
      setMessageType("error");
      void Swal.fire({
        icon: "error",
        title: "تعذر رفع الملف",
        text: errorMessage,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#25396E",
      });
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const deleteGalleryImage = async (image: GalleryImage) => {
    if (!image.deletable || !(await confirmDelete("تأكيد حذف الملف"))) {
      return;
    }

    try {
      const response = await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ src: image.src }),
      });
      const payload = (await response.json()) as { message?: string };

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(payload.message ?? "تعذر حذف الملف.");
      }

      setGalleryImages((current) => current.filter((item) => item.src !== image.src));
      showSaveToast(payload.message ?? "تم حذف الملف");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "تعذر حذف الملف.";
      setMessage(errorMessage);
      setMessageType("error");
      void Swal.fire({
        icon: "error",
        title: "تعذر حذف الملف",
        text: errorMessage,
        confirmButtonText: "حسناً",
        confirmButtonColor: "#25396E",
      });
    }
  };

  useEffect(() => {
    if (activeSection === "gallery") {
      void loadGalleryImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

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
          onOpenGallery={openGalleryModal}
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
              type={
                isImageAssetKey(key) ? "image" : key.toLowerCase().includes("email") || key === "phone" ? "text" : "url"
              }
              value={value}
              onChange={(nextValue) => updateValue([...path, key], nextValue)}
              onOpenGallery={openGalleryModal}
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
                onOpenGallery={openGalleryModal}
              />
              <button
                type="button"
                className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                onClick={async () => {
                  if (await confirmDelete()) {
                    updateValue(path, items.filter((_, itemIndex) => itemIndex !== index));
                  }
                }}
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
                  onClick={async () => {
                    if (await confirmDelete()) {
                      updateValue(path, items.filter((_, itemIndex) => itemIndex !== index));
                    }
                  }}
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
                    type={isImageObjectField(field) ? "image" : field.type}
                    options={field.options}
                    value={item[field.key]}
                    onChange={(value) => updateValue([...path, index, field.key], value)}
                    onOpenGallery={openGalleryModal}
                  />
                ))}
              </div>
            </article>
          ))}
        </div>
      </EditorCard>
    );
  };

  const renderInlineObjectList = (
    title: string,
    path: Path,
    fields: FieldDef[],
    createItem: () => DraftRecord,
    addLabel = "إضافة عنصر",
  ) => {
    const items = getValue<DraftRecord[]>(path, []);

    return (
      <div className="rounded-lg border border-line bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-base font-black text-brand-800">{title}</h4>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-brand-800"
            onClick={() => updateValue(path, [...items, createItem()])}
          >
            <Plus size={14} aria-hidden="true" />
            {addLabel}
          </button>
        </div>

        <div className="grid gap-3">
          {items.map((item, index) => (
            <div className="rounded-lg border border-line bg-surface p-3" key={`${path.join(".")}-${index}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black text-muted">#{index + 1}</span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                  onClick={async () => {
                    if (await confirmDelete()) {
                      updateValue(path, items.filter((_, itemIndex) => itemIndex !== index));
                    }
                  }}
                  aria-label="حذف"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {fields.map((field) => (
                  <DashboardField
                    key={field.key}
                    label={field.label}
                    type={isImageObjectField(field) ? "image" : field.type}
                    options={field.options}
                    value={item[field.key]}
                    onChange={(value) => updateValue([...path, index, field.key], value)}
                    onOpenGallery={openGalleryModal}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const saveContent = async () => {
    setIsSaving(true);
    setMessage("جاري الحفظ...");
    setMessageType("idle");

    try {
      const contentToSave = sanitizeSiteContent(draft);
      const response = await fetch("/api/admin/site-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: contentToSave }),
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
      showSaveToast(payload.message ?? "تم حفظ المحتوى");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ المحتوى.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
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
      showSaveToast(payload.message ?? "تمت إضافة المدير");
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
      showSaveToast(payload.message ?? "تم حفظ بيانات المدير");
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
          { key: "logo", label: "الشعار", type: "image" },
        ],
        () => ({ name: "", logo: "" }),
        "إضافة شعار",
      )}
    </div>
  );

  const renderSocialLinksEditor = () => {
    const socialLinks = normalizeSocialLinks(getValue<SocialLink[]>(["socialLinks"], []));
    const usedPlatforms = new Set(socialLinks.map((link) => link.label));
    const availablePlatforms = socialPlatforms.filter((platform) => !usedPlatforms.has(platform.label));
    const selectedPlatform =
      availablePlatforms.find((platform) => platform.label === socialPlatformToAdd) ?? availablePlatforms[0];

    const updateSocialLinks = (links: SocialLink[]) => {
      updateValue(["socialLinks"], normalizeSocialLinks(links));
    };

    const addSocialPlatform = () => {
      if (!selectedPlatform) {
        return;
      }

      updateSocialLinks([
        ...socialLinks,
        {
          label: selectedPlatform.label,
          short: selectedPlatform.short,
          href: "",
        },
      ]);

      const nextAvailable = availablePlatforms.find((platform) => platform.label !== selectedPlatform.label);
      setSocialPlatformToAdd(nextAvailable?.label ?? socialPlatforms[0].label);
    };

    const updateSocialValue = (platform: SocialPlatform, value: string) => {
      updateSocialLinks(
        socialLinks.map((link) =>
          link.label === platform.label
            ? {
                label: platform.label,
                short: platform.short,
                href: buildSocialHref(platform, value),
              }
            : link,
        ),
      );
    };

    const deleteSocialPlatform = async (platform: SocialPlatform) => {
      if (await confirmDelete(`تأكيد حذف ${platform.label}`)) {
        updateSocialLinks(socialLinks.filter((link) => link.label !== platform.label));
        setSocialPlatformToAdd(platform.label);
      }
    };

    return (
      <EditorCard
        title="روابط التواصل الاجتماعي"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPlatform?.label ?? ""}
              disabled={availablePlatforms.length === 0}
              onChange={(event) => setSocialPlatformToAdd(event.target.value)}
              className="min-h-10 rounded-md border border-line bg-white px-3 py-2 text-sm font-extrabold text-ink shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="اختيار وسيلة تواصل"
            >
              {availablePlatforms.length > 0 ? (
                availablePlatforms.map((platform) => (
                  <option value={platform.label} key={platform.label}>
                    {platform.label}
                  </option>
                ))
              ) : (
                <option value="">كل الوسائل مضافة</option>
              )}
            </select>
            <button
              type="button"
              disabled={!selectedPlatform}
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={addSocialPlatform}
            >
              <Plus size={16} aria-hidden="true" />
              إضافة
            </button>
          </div>
        }
      >
        <div className="grid gap-4">
          {socialLinks.map((link) => {
            const platform = findSocialPlatform(link.label);

            if (!platform) {
              return null;
            }

            return (
              <article className="rounded-lg border border-line bg-surface p-4" key={platform.label}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                      {platform.short}
                    </span>
                    <div>
                      <h3 className="text-lg text-brand-800">{platform.label}</h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                    onClick={() => deleteSocialPlatform(platform)}
                    aria-label={`حذف ${platform.label}`}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <label className="block text-sm font-extrabold text-ink">
                    {platform.valueLabel}
                    <input
                      type="text"
                      value={socialValueFromHref(platform, link.href)}
                      placeholder={platform.placeholder}
                      onChange={(event) => updateSocialValue(platform, event.target.value)}
                      className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/10"
                    />
                  </label>

                  <a
                    href={link.href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-extrabold transition",
                      link.href
                        ? "border-line bg-white text-ink hover:bg-mist"
                        : "pointer-events-none border-line bg-white text-muted opacity-50",
                    )}
                  >
                    معاينة الرابط
                  </a>
                </div>
              </article>
            );
          })}

          {socialLinks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-surface p-5 text-center text-sm font-bold text-muted">
              لا توجد وسائل تواصل مضافة. اختر منصة من الأعلى ثم اضغط إضافة.
            </div>
          ) : null}
        </div>
      </EditorCard>
    );
  };

  const renderGalleryUploadButton = (label = "رفع ملفات") => (
    <label
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-800",
        isGalleryUploading && "pointer-events-none opacity-60",
      )}
    >
      {isGalleryUploading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />}
      {label}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        disabled={isGalleryUploading}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = "";
          void uploadGalleryFiles(files);
        }}
      />
    </label>
  );

  const renderGalleryGrid = (selectable = false) => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {galleryImages.map((image) => {
        const isSelected = galleryTarget?.value === image.src;
        const fileSize = formatFileSize(image.size);

        return (
          <article
            className={cn(
              "overflow-hidden rounded-lg border bg-white shadow-sm transition",
              isSelected ? "border-brand-600 ring-2 ring-brand-600/15" : "border-line",
            )}
            key={image.src}
          >
            <button
              type="button"
              disabled={!selectable}
              onClick={() => {
                if (!selectable || !galleryTarget) {
                  return;
                }

                galleryTarget.onSelect(image.src);
                closeGalleryModal();
              }}
              className={cn(
                "flex h-40 w-full items-center justify-center bg-mist",
                selectable && "transition hover:bg-brand-50",
              )}
            >
              {image.mediaType === "video" ? (
                <video src={image.src} className="h-full w-full object-contain" muted playsInline />
              ) : (
                <img src={image.src} alt="" className="h-full w-full object-contain" />
              )}
            </button>

            <div className="grid gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-ink">{image.name}</p>
                <p className="mt-1 truncate text-xs font-bold text-muted">
                  {image.origin === "uploads" ? "مرفوعة" : "أصلية"}
                  {` · ${image.mediaType === "video" ? "فيديو" : "صورة"}`}
                  {fileSize ? ` · ${fileSize}` : ""}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-xs font-bold text-muted">{image.src}</p>
                {image.deletable ? (
                  <button
                    type="button"
                    onClick={() => void deleteGalleryImage(image)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                    aria-label={`حذف ${image.name}`}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const renderGalleryManager = () => (
    <EditorCard
      title="المعرض"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadGalleryImages()}
            disabled={isGalleryLoading}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGalleryLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}
            تحديث
          </button>
          {renderGalleryUploadButton()}
        </div>
      }
    >
      {isGalleryLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-line bg-surface text-sm font-bold text-muted">
          <Loader2 size={22} className="animate-spin" aria-hidden="true" />
        </div>
      ) : galleryImages.length > 0 ? (
        renderGalleryGrid()
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm font-bold text-muted">
          لا توجد ملفات في المعرض.
        </div>
      )}
    </EditorCard>
  );

  const renderSponsorsPageEditor = () => {
    const tiers = getValue<DraftRecord[]>(["secondaryPages", "sponsors", "tiers"], []);

    return (
      <div className="grid gap-5">
        <EditorCard title="صفحة الرعاة">
          {renderFields(
            ["secondaryPages", "sponsors"],
            [
              { key: "title", label: "عنوان الصفحة" },
              { key: "description", label: "الوصف", type: "textarea" },
            ],
            "md:grid-cols-1",
          )}
        </EditorCard>

        {renderObjectList(
          "مميزات الرعاة",
          ["secondaryPages", "sponsors", "benefits"],
          [
            { key: "label", label: "النص" },
            { key: "icon", label: "الأيقونة", type: "icon", options: sponsorIconOptions },
          ],
          () => ({ label: "", icon: "globe" }),
          "إضافة ميزة",
        )}

        <EditorCard
          title="فئات الرعاية"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-brand-800"
              onClick={() =>
                updateValue(
                  ["secondaryPages", "sponsors", "tiers"],
                  [
                    ...tiers,
                    {
                      key: `tier-${tiers.length + 1}`,
                      tabLabel: "",
                      icon: "star",
                      title: "",
                      description: "",
                      stats: [],
                      miniBenefits: [],
                    },
                  ],
                )
              }
            >
              <Plus size={16} aria-hidden="true" />
              إضافة فئة
            </button>
          }
        >
          <div className="grid gap-5">
            {tiers.map((_, index) => (
              <article className="rounded-lg border border-line bg-surface p-4" key={`sponsor-tier-${index}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-base text-brand-800">فئة #{index + 1}</h3>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                    onClick={async () => {
                      if (await confirmDelete("تأكيد حذف فئة الرعاية")) {
                        updateValue(
                          ["secondaryPages", "sponsors", "tiers"],
                          tiers.filter((__, tierIndex) => tierIndex !== index),
                        );
                      }
                    }}
                    aria-label="حذف"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>

                {renderFields(
                  ["secondaryPages", "sponsors", "tiers", index],
                  [
                    { key: "key", label: "المعرّف بالإنجليزية" },
                    { key: "tabLabel", label: "اسم التبويب" },
                    { key: "icon", label: "الأيقونة", type: "icon", options: sponsorIconOptions },
                    { key: "title", label: "العنوان" },
                    { key: "description", label: "الوصف", type: "textarea" },
                  ],
                  "md:grid-cols-2",
                )}

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {renderInlineObjectList(
                    "الأرقام",
                    ["secondaryPages", "sponsors", "tiers", index, "stats"],
                    [
                      { key: "value", label: "القيمة" },
                      { key: "label", label: "الوصف" },
                    ],
                    () => ({ value: "", label: "" }),
                    "إضافة رقم",
                  )}

                  {renderInlineObjectList(
                    "المزايا المصغرة",
                    ["secondaryPages", "sponsors", "tiers", index, "miniBenefits"],
                    [
                      { key: "label", label: "النص" },
                      { key: "icon", label: "الأيقونة", type: "icon", options: sponsorIconOptions },
                    ],
                    () => ({ label: "", icon: "globe" }),
                    "إضافة ميزة",
                  )}
                </div>
              </article>
            ))}
          </div>
        </EditorCard>

        <EditorCard title="نداء صفحة الرعاة">
          {renderFields(
            ["secondaryPages", "sponsors"],
            [{ key: "ctaTitle", label: "النص", type: "textarea" }],
            "md:grid-cols-1",
          )}
        </EditorCard>

        {renderObjectList(
          "أزرار صفحة الرعاة",
          ["secondaryPages", "sponsors", "ctaButtons"],
          [
            { key: "label", label: "نص الزر" },
            { key: "href", label: "الرابط", type: "url" },
            { key: "icon", label: "الأيقونة", type: "icon", options: sponsorIconOptions },
          ],
          () => ({ label: "", href: "", icon: "arrow" }),
          "إضافة زر",
        )}
      </div>
    );
  };

  const activeContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="grid gap-5">
            <EditorCard title="بيانات عامة">
              {renderFields(
                ["metadata"],
                [
                  { key: "title", label: "عنوان الموقع" },
                  { key: "description", label: "وصف الموقع", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            <EditorCard title="روابط أساسية">
              {renderFields(["links"], [
                { key: "visitorRegistration", label: "رابط تسجيل الزائر", type: "url" },
                { key: "exhibitorRegistration", label: "رابط تسجيل العارض", type: "url" },
                { key: "whatsapp", label: "رابط واتساب", type: "url" },
                { key: "email", label: "البريد الإلكتروني" },
                { key: "phone", label: "الهاتف" },
                { key: "map", label: "رابط الخريطة", type: "url" },
              ])}
            </EditorCard>
          </div>
        );

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

      case "gallery":
        return renderGalleryManager();

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
            <EditorCard title="فيديو الهيرو">
              {renderFields(
                ["assets"],
                [
                  { key: "heroVideo", label: "فيديو الهيرو", type: "video" },
                  { key: "heroPoster", label: "غلاف الفيديو", type: "image" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            <EditorCard title="نص البطاقة">
              {renderFields(
                ["hero"],
                [
                  { key: "imageAlt", label: "وصف الفيديو" },
                  { key: "figureTitle", label: "عنوان البطاقة" },
                  { key: "figureDescription", label: "وصف البطاقة", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
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

      case "visitors-page":
        return (
          <div className="grid gap-5">
            <EditorCard title="صفحة الزوار">
              {renderFields(
                ["secondaryPages", "visitors"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "lead", label: "الوصف", type: "textarea" },
                  { key: "note", label: "الملاحظة" },
                  { key: "iframeSrc", label: "رابط النموذج", type: "url" },
                  { key: "iframeTitle", label: "عنوان iframe" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "خطوات التسجيل",
              ["secondaryPages", "visitors", "steps"],
              [
                { key: "title", label: "عنوان الخطوة" },
                { key: "description", label: "وصف الخطوة", type: "textarea" },
              ],
              () => ({ title: "", description: "" }),
              "إضافة خطوة",
            )}
          </div>
        );

      case "exhibitors-page":
        return (
          <EditorCard title="صفحة العارضين">
            {renderFields(
              ["secondaryPages", "exhibitors"],
              [
                { key: "topPanelTitle", label: "النص العلوي", type: "textarea" },
                { key: "iframeSrc", label: "رابط النموذج", type: "url" },
                { key: "iframeTitle", label: "عنوان iframe" },
              ],
              "md:grid-cols-1",
            )}
          </EditorCard>
        );

      case "sponsors-page":
        return renderSponsorsPageEditor();

      case "media-page":
        return (
          <div className="grid gap-5">
            <EditorCard title="المركز الإعلامي">
              {renderFields(
                ["secondaryPages", "media"],
                [
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                  { key: "readMoreLabel", label: "نص رابط قراءة الخبر" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "إحصائيات المركز الإعلامي",
              ["secondaryPages", "media", "stats"],
              [
                { key: "value", label: "القيمة" },
                { key: "label", label: "الوصف" },
              ],
              () => ({ value: "", label: "" }),
              "إضافة إحصائية",
            )}
            {renderObjectList(
              "المقالات الصحفية",
              ["secondaryPages", "media", "articles"],
              [
                { key: "title", label: "العنوان" },
                { key: "source", label: "المصدر" },
                { key: "href", label: "رابط الخبر", type: "url" },
                { key: "image", label: "الصورة", type: "image" },
                { key: "alt", label: "النص البديل للصورة" },
                { key: "description", label: "الوصف", type: "textarea" },
              ],
              () => ({ title: "", source: "", href: "", image: "", alt: "", description: "" }),
              "إضافة مقال",
            )}
          </div>
        );

      case "privacy-page":
        return (
          <div className="grid gap-5">
            <EditorCard title="سياسة الخصوصية">
              {renderFields(
                ["secondaryPages", "privacy"],
                [
                  { key: "eyebrow", label: "الوسم" },
                  { key: "title", label: "العنوان" },
                  { key: "description", label: "الوصف", type: "textarea" },
                  { key: "updatedLabel", label: "تسمية تاريخ التحديث" },
                  { key: "updatedAt", label: "تاريخ التحديث" },
                  { key: "intro", label: "المقدمة", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "بنود السياسة",
              ["secondaryPages", "privacy", "sections"],
              [
                { key: "title", label: "عنوان البند" },
                { key: "body", label: "النص", type: "textarea" },
              ],
              () => ({ title: "", body: "" }),
              "إضافة بند",
            )}
            <EditorCard title="قسم التواصل للخصوصية">
              {renderFields(
                ["secondaryPages", "privacy"],
                [
                  { key: "contactTitle", label: "عنوان التواصل" },
                  { key: "contactDescription", label: "وصف التواصل", type: "textarea" },
                ],
                "md:grid-cols-1",
              )}
            </EditorCard>
            {renderObjectList(
              "وسائل التواصل",
              ["secondaryPages", "privacy", "contactItems"],
              [
                { key: "label", label: "العنوان" },
                { key: "value", label: "القيمة" },
                { key: "href", label: "الرابط", type: "url" },
              ],
              () => ({ label: "", value: "", href: "" }),
              "إضافة وسيلة",
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
        return renderSocialLinksEditor();

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
            <h1 className="text-2xl text-brand-900 sm:text-3xl">لوحة تحرير محتوى سيريدو</h1>
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
            <div className="grid gap-2">
              {dashboardGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = openGroups[group.id];
                const groupHasActiveSection = group.sectionIds.includes(activeSection);

                return (
                  <section className="rounded-md border border-line/70 bg-surface/60 p-1" key={group.id}>
                    <button
                      type="button"
                      onClick={() => toggleDashboardGroup(group.id)}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2 text-right text-sm font-black transition",
                        groupHasActiveSection ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-white",
                      )}
                      aria-expanded={isOpen}
                    >
                      <GroupIcon size={18} aria-hidden="true" />
                      <span className="min-w-0 flex-1">{group.label}</span>
                      <ChevronDown
                        size={17}
                        className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen ? (
                      <div className="mt-1 grid gap-1 border-t border-line/70 pt-1">
                        {group.sectionIds.map((sectionId) => {
                          const section = sectionsById[sectionId];
                          const Icon = section.icon;
                          const isActive = activeSection === section.id;

                          return (
                            <button
                              type="button"
                              key={section.id}
                              onClick={() => activateSection(section.id, group.id)}
                              className={cn(
                                "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-right text-sm font-extrabold transition",
                                isActive ? "bg-brand-600 text-white shadow-sm" : "text-ink/80 hover:bg-white hover:text-brand-800",
                              )}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <Icon size={17} aria-hidden="true" />
                              <span>{section.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
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

      {isGalleryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={closeGalleryModal}
            aria-label="إغلاق المعرض"
          />
          <section className="relative z-10 flex max-h-[88vh] w-[min(1060px,100%)] flex-col overflow-hidden rounded-lg border border-line bg-white shadow-strong">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
              <div>
                <h2 className="text-xl text-brand-800">المعرض</h2>
                <p className="mt-1 text-xs font-bold text-muted">{galleryImages.length} ملف</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {renderGalleryUploadButton("رفع ملف")}
                <button
                  type="button"
                  onClick={() => void loadGalleryImages()}
                  disabled={isGalleryLoading}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="تحديث المعرض"
                >
                  {isGalleryLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={closeGalleryModal}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white text-ink transition hover:bg-mist"
                  aria-label="إغلاق"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {isGalleryLoading ? (
                <div className="flex min-h-72 items-center justify-center rounded-lg border border-line bg-surface text-sm font-bold text-muted">
                  <Loader2 size={24} className="animate-spin" aria-hidden="true" />
                </div>
              ) : galleryImages.length > 0 ? (
                renderGalleryGrid(true)
              ) : (
                <div className="rounded-lg border border-dashed border-line bg-surface p-8 text-center text-sm font-bold text-muted">
                  لا توجد ملفات في المعرض.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
