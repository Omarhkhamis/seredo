import { redirect } from "next/navigation";
import { SiteDashboard } from "@/components/admin/SiteDashboard";
import {
  getCurrentAdminFromCookies,
  listAdminUsers,
} from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentAdmin = await getCurrentAdminFromCookies();

  if (!currentAdmin) {
    redirect("/admin-se?next=/dashboard");
  }

  const content = await getSiteContent();
  const admins = await listAdminUsers();

  return (
    <SiteDashboard
      initialContent={content}
      currentAdmin={currentAdmin}
      initialAdmins={admins}
    />
  );
}
