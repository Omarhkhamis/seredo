import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SponsorsPage } from "@/components/pages/SponsorsPage";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function SponsorsRoutePage() {
  const site = await getSiteContent();

  return (
    <>
      <Header site={site} />
      <main id="seredo-top">
        <SponsorsPage site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
