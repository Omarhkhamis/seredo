import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MediaCoveragePage } from "@/components/pages/MediaCoveragePage";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const site = await getSiteContent();

  return (
    <>
      <Header site={site} />
      <main id="seredo-top">
        <MediaCoveragePage site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
