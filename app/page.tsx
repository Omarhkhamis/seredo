import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AboutSection } from "@/components/sections/AboutSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
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

export default function Home() {
  return (
    <>
      <Header />
      <main id="seredo-top">
        <HeroSection />
        <EventInfoSection />
        <AboutSection />
        <PillarsSection />
        <TracksSection />
        <DeepAboutSection />
        <EcosystemSection />
        <StatsSection />
        <AudienceSection />
        <SectorsSection />
        <PartnersSection />
        <FinalCtaSection />
      </main>
      <Footer />
      <ClientEffects />
    </>
  );
}
