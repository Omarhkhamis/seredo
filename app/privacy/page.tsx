import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PrivacyPolicyPage } from "@/components/pages/PrivacyPolicyPage";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContent();
  const page = site.secondaryPages.privacy;

  return {
    title: `${page.eyebrow} | ${site.metadata.title}`,
    description: page.description,
  };
}

export default async function PrivacyPage() {
  const site = await getSiteContent();

  return (
    <>
      <Header site={site} />
      <main id="seredo-top">
        <PrivacyPolicyPage site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
