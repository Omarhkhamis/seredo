import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "storage", "uploads");
const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function safeFilename(filename: string) {
  if (!filename || filename !== path.basename(filename)) {
    return null;
  }

  const extension = path.extname(filename).toLowerCase();

  if (!contentTypes[extension]) {
    return null;
  }

  return filename;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename: rawFilename } = await context.params;
  const filename = safeFilename(rawFilename);

  if (!filename) {
    return NextResponse.json({ message: "الصورة غير موجودة." }, { status: 404 });
  }

  try {
    const file = await readFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, filename));
    const contentType = contentTypes[path.extname(filename).toLowerCase()] ?? "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "الصورة غير موجودة." }, { status: 404 });
  }
}
