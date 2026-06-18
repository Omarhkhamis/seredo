import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getCurrentAdminFromCookies } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdminFromCookies();

  if (admin) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-10 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-md place-items-center">
        <section className="w-full rounded-lg border border-line bg-white p-6 shadow-strong">
          <div className="mb-7">
            <p className="inline-flex rounded-full border border-brand-600/15 bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
              admin-se
            </p>
            <h1 className="mt-4 text-2xl text-brand-900">تسجيل دخول الداشبورد</h1>
          </div>
          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}
