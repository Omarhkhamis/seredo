import { randomUUID } from "node:crypto";
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentAdminFromRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const PUBLIC_ASSET_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "assets", "seredo");
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "uploads");
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const allowedMimeTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

type GalleryImage = {
  src: string;
  name: string;
  origin: "assets" | "uploads";
  deletable: boolean;
  size?: number;
  updatedAt?: string;
};

function isImageFilename(filename: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(filename);
}

function slugifyFilename(filename: string) {
  const extension = path.extname(filename);
  const name = path.basename(filename, extension);
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "image";
}

function uploadFilenameFromSrc(src: string) {
  if (!src.startsWith("/uploads/")) {
    return null;
  }

  const filename = decodeURIComponent(src.slice("/uploads/".length).split(/[?#]/)[0] ?? "");

  if (!filename || filename !== path.basename(filename) || !isImageFilename(filename)) {
    return null;
  }

  return filename;
}

async function listImagesFromDirectory(
  directory: string,
  srcPrefix: string,
  origin: GalleryImage["origin"],
  deletable: boolean,
) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const images = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && isImageFilename(entry.name))
        .map(async (entry) => {
          const fileStat = await stat(path.join(directory, entry.name));

          return {
            src: `${srcPrefix}/${encodeURIComponent(entry.name)}`,
            name: entry.name,
            origin,
            deletable,
            size: fileStat.size,
            updatedAt: fileStat.mtime.toISOString(),
          } satisfies GalleryImage;
        }),
    );

    return images.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function requireAdmin(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return false;
  }

  return true;
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  try {
    const [assetImages, uploadedImages] = await Promise.all([
      listImagesFromDirectory(PUBLIC_ASSET_DIR, "/assets/seredo", "assets", false),
      listImagesFromDirectory(UPLOAD_DIR, "/uploads", "uploads", true),
    ]);

    return NextResponse.json({
      images: [...uploadedImages, ...assetImages],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تحميل معرض الصور.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "لم يتم اختيار ملف صورة." }, { status: 400 });
    }

    const extension = allowedMimeTypes.get(file.type);

    if (!extension) {
      return NextResponse.json({ message: "صيغة الصورة غير مدعومة." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ message: "حجم الصورة يجب أن لا يتجاوز 8MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}-${slugifyFilename(file.name)}.${extension}`;
    const targetPath = path.join(UPLOAD_DIR, filename);

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(targetPath, buffer, { flag: "wx" });

    const fileStat = await stat(targetPath);
    const image: GalleryImage = {
      src: `/uploads/${encodeURIComponent(filename)}`,
      name: filename,
      origin: "uploads",
      deletable: true,
      size: fileStat.size,
      updatedAt: fileStat.mtime.toISOString(),
    };

    return NextResponse.json({
      image,
      message: "تم رفع الصورة بنجاح.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر رفع الصورة.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { src?: string };
    const filename = uploadFilenameFromSrc(body.src ?? "");

    if (!filename) {
      return NextResponse.json({ message: "يمكن حذف الصور المرفوعة فقط." }, { status: 400 });
    }

    await rm(path.join(UPLOAD_DIR, filename), { force: true });

    return NextResponse.json({
      message: "تم حذف الصورة بنجاح.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حذف الصورة.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
