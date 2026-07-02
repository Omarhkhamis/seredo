import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AboutSection } from "@/components/sections/AboutSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { ConstructionServicesSection } from "@/components/sections/ConstructionServicesSection";
import { DeepAboutSection } from "@/components/sections/DeepAboutSection";
import { EcosystemSection } from "@/components/sections/EcosystemSection";
import { EventInfoSection } from "@/components/sections/EventInfoSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { PillarsSection } from "@/components/sections/PillarsSection";
import { SectorsSection } from "@/components/sections/SectorsSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { TracksSection } from "@/components/sections/TracksSection";
import { ClientEffects } from "@/components/ui/ClientEffects";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const site = await getSiteContent();

  return (
    <>
      <Header site={site} />
      <main id="seredo-top">
        <HeroSection site={site} />
        <EventInfoSection site={site} />
        <AboutSection site={site} />
        <PillarsSection site={site} />
        <TracksSection site={site} />
        <DeepAboutSection site={site} />
        <EcosystemSection site={site} />
        <StatsSection site={site} />
        <AudienceSection site={site} />
        <SectorsSection site={site} />
        <ConstructionServicesSection site={site} />
        <PartnersSection site={site} />
        <FinalCtaSection site={site} />
      </main>
      <Footer site={site} />
      <ClientEffects />
    </>
  );
}
