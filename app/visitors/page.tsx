import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { VisitorsRegistrationPage } from "@/components/pages/RegistrationPages";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function VisitorsPage() {
  const site = await getSiteContent();

  return (
    <>
      <Header site={site} />
      <main id="seredo-top">
        <VisitorsRegistrationPage site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
