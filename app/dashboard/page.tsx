import { redirect } from "next/navigation";
import { SiteDashboard } from "@/components/admin/SiteDashboard";
import {
  getCurrentAdminFromCookies,
  isFullAdmin,
  listAdminUsers,
} from "@/lib/admin-auth";
import { listGateStaff } from "@/lib/gate-staff";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentAdmin = await getCurrentAdminFromCookies();

  if (!currentAdmin) {
    redirect("/admin-se?next=/dashboard");
  }

  const content = await getSiteContent();
  const [admins, gateStaff] = await Promise.all([
    isFullAdmin(currentAdmin) ? listAdminUsers() : Promise.resolve([]),
    listGateStaff(),
  ]);

  return (
    <SiteDashboard
      initialContent={content}
      currentAdmin={currentAdmin}
      initialAdmins={admins}
      initialGateStaff={gateStaff}
    />
  );
}
