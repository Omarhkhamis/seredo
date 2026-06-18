import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ExhibitorsRegistrationPage } from "@/components/pages/RegistrationPages";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function ExhibitorsPage() {
  const site = await getSiteContent();

  return (
    <>
      <Header site={site} />
      <main id="seredo-top">
        <ExhibitorsRegistrationPage site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
