import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentAdminFromRequest } from "@/lib/admin-auth";
import {
  getSiteContent,
  hasDatabaseConnection,
  normalizeSiteContent,
  saveSiteContent,
} from "@/lib/site-content";

export async function GET(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  const content = await getSiteContent();

  return NextResponse.json({
    content,
    databaseConfigured: hasDatabaseConnection(),
  });
}

export async function POST(request: Request) {
  const admin = await getCurrentAdminFromRequest(request);

  if (!admin) {
    return NextResponse.json({ message: "يجب تسجيل الدخول أولاً." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { content?: unknown };
    const content = normalizeSiteContent(body.content);

    await saveSiteContent(content);
    revalidatePath("/");
    revalidatePath("/dashboard");

    return NextResponse.json({
      content,
      message: "تم حفظ المحتوى بنجاح.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حفظ المحتوى.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
