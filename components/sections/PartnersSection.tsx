import Image from "next/image";
import { defaultSiteContent, type SiteContent, type SiteContentPartner } from "@/data/site";

const governmentLogoUrls = [
  "/assets/seredo/partners/partner-001-ministry-of-housing-6-scaled-e1781591519236.jpg",
  "/assets/seredo/partners/partner-002-nhc-logo-ntlgreen-h-rgb.png",
  "/assets/seredo/partners/partner-003-untitled-22-2026-12-10-44.png",
  "/assets/seredo/partners/partner-004-page-0001-scaled-e1781591478427.jpg",
  "/assets/seredo/partners/partner-005-jeddah-municipality-logo-page-0001-scaled-e1781591459845.jpg",
  "/assets/seredo/partners/partner-006-rega-logo-page-0001-scaled.jpg",
  "/assets/seredo/partners/partner-007-60409-e1781591431483.jpg",
  "/assets/seredo/partners/partner-008-makkah-chamber-of-commerce-logo.png",
] as const;

const financeLogoUrls = [
  "/assets/seredo/partners/partner-009-alinma-bank-logo-cmyk-2-scaled.png",
  "/assets/seredo/partners/partner-010-anb-logo-4m-bank-e1781594579153.png",
  "/assets/seredo/partners/partner-011-snb-brandmark-artwork-cmyk-primary.png",
  "/assets/seredo/partners/partner-012-logo.png",
  "/assets/seredo/partners/partner-013-bank-albilad-logo.png",
] as const;

const exhibitorLogoUrls = [
  "/assets/seredo/exp/exp1.webp",
  "/assets/seredo/exp/exp2.webp",
  "/assets/seredo/exp/exp3.webp",
  "/assets/seredo/exp/exp4.webp",
  "/assets/seredo/exp/exp5.webp",
  "/assets/seredo/exp/exp6.webp",
  "/assets/seredo/exp/exp7.webp",
  "/assets/seredo/exp/exp8.webp",
  "/assets/seredo/exp/exp9.webp",
  "/assets/seredo/exp/exp10.webp",
  "/assets/seredo/exp/exp11.webp",
  "/assets/seredo/exp/exp12.webp",
  "/assets/seredo/exp/exp13.webp",
  "/assets/seredo/exp/exp14.webp",
  "/assets/seredo/exp/exp15.webp",
  "/assets/seredo/exp/exp16.webp",
  "/assets/seredo/exp/exp17.webp",
  "/assets/seredo/exp/exp18.webp",
  "/assets/seredo/exp/exp19.webp",
  "/assets/seredo/exp/exp20.webp",
  "/assets/seredo/exp/exp21.webp",
  "/assets/seredo/exp/exp22.webp",
  "/assets/seredo/exp/exp23.webp",
  "/assets/seredo/exp/exp24.webp",
  "/assets/seredo/exp/exp25.webp",
  "/assets/seredo/exp/exp26.webp",
  "/assets/seredo/exp/exp27.webp",
  "/assets/seredo/exp/exp28.webp",
  "/assets/seredo/exp/exp29.webp",
  "/assets/seredo/exp/exp30.webp",
  "/assets/seredo/exp/exp31.webp",
  "/assets/seredo/exp/exp32.webp",
  "/assets/seredo/exp/exp33.webp",
  "/assets/seredo/exp/exp34.webp",
  "/assets/seredo/exp/exp35.webp",
  "/assets/seredo/exp/exp36.webp",
  "/assets/seredo/exp/exp37.webp",
  "/assets/seredo/exp/exp38.webp",
  "/assets/seredo/exp/exp39.webp",
  "/assets/seredo/exp/exp40.webp",
  "/assets/seredo/exp/exp41.webp",
  "/assets/seredo/exp/exp42.webp",
  "/assets/seredo/exp/exp43.webp",
  "/assets/seredo/exp/exp44.webp",
  "/assets/seredo/exp/exp45.webp",
  "/assets/seredo/exp/exp46.webp",
  "/assets/seredo/exp/exp47.webp",
  "/assets/seredo/exp/exp48.webp",
  "/assets/seredo/exp/exp49.webp",
  "/assets/seredo/exp/exp50.webp",
  "/assets/seredo/exp/exp51.webp",
  "/assets/seredo/exp/exp52.webp",
  "/assets/seredo/exp/exp53.webp",
  "/assets/seredo/exp/exp54.webp",
  "/assets/seredo/exp/exp55.webp",
  "/assets/seredo/exp/exp56.webp",
  "/assets/seredo/exp/exp57.webp",
  "/assets/seredo/exp/exp58.webp",
  "/assets/seredo/exp/exp59.webp",
  "/assets/seredo/exp/exp60.webp",
  "/assets/seredo/exp/exp61.webp",
  "/assets/seredo/exp/exp62.webp",
  "/assets/seredo/exp/exp63.webp",
  "/assets/seredo/exp/exp64.webp",
  "/assets/seredo/exp/exp65.webp",
  "/assets/seredo/exp/exp66.webp",
  "/assets/seredo/exp/exp67.webp",
  "/assets/seredo/exp/exp68.webp",
  "/assets/seredo/exp/exp69.webp",
  "/assets/seredo/exp/exp70.webp",
  "/assets/seredo/exp/exp71.webp",
  "/assets/seredo/exp/exp72.webp",
  "/assets/seredo/exp/exp73.webp",
  "/assets/seredo/exp/exp74.webp",
  "/assets/seredo/exp/exp75.webp",
  "/assets/seredo/exp/exp76.webp",
  "/assets/seredo/exp/exp77.webp",
  "/assets/seredo/exp/exp78.webp",
  "/assets/seredo/exp/exp79.webp",
  "/assets/seredo/exp/exp80.webp",
  "/assets/seredo/exp/exp81.webp",
  "/assets/seredo/exp/exp82.webp",
  "/assets/seredo/exp/exp83.webp",
  "/assets/seredo/exp/exp84.webp",
] as const;

function makeLogoItems(prefix: string, urls: readonly string[]) {
  return urls.map((logo, index) => ({
    name: `${prefix} ${String(index + 1).padStart(2, "0")}`,
    logo,
  }));
}

function LogoCell({
  partner,
  hidden = false,
  className = "",
  imageClassName = "max-h-[96px]",
  imageWidth = 280,
  imageHeight = 140,
}: {
  partner: SiteContentPartner;
  hidden?: boolean;
  className?: string;
  imageClassName?: string;
  imageWidth?: number;
  imageHeight?: number;
}) {
  return (
    <div className={`logo-cell ${className}`} aria-hidden={hidden || undefined}>
      <Image
        src={partner.logo}
        alt={hidden ? "" : partner.name}
        width={imageWidth}
        height={imageHeight}
        className={`h-auto w-auto max-w-full object-contain ${imageClassName}`}
      />
    </div>
  );
}

const partnerGroupClass =
  "reveal rounded-[24px] border border-line bg-white/90 p-5 shadow-[0_18px_54px_rgba(15,23,51,0.06)] sm:rounded-[28px] sm:p-6 lg:rounded-[30px] lg:p-8";

const partnerHeadClass = "mb-5 border-b border-line pb-5 lg:mb-6 lg:pb-6";
const partnerTitleClass = "font-display text-[28px] font-black leading-none text-brand-700 sm:text-3xl lg:text-4xl";

type PartnersSectionProps = {
  site?: SiteContent;
};

export function PartnersSection({ site = defaultSiteContent }: PartnersSectionProps) {
  const section = site.partnersSection;
  const { government, finance, exhibitors, media } = section.groups;
  const governmentItems = makeLogoItems("جهة حكومية", governmentLogoUrls);
  const financeItems = makeLogoItems("جهة تمويلية", financeLogoUrls);
  const exhibitorItems = makeLogoItems("عارض", exhibitorLogoUrls);
  const governmentGroups = [governmentItems, governmentItems];
  const exhibitorGroups = [exhibitorItems, exhibitorItems];

  return (
    <section id="seredo-partners" className="relative overflow-hidden bg-white py-14 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(760px_360px_at_8%_16%,rgba(13,92,99,0.055),transparent_62%),radial-gradient(850px_420px_at_85%_0%,rgba(37,57,110,0.08),transparent_62%)]" />
      <div className="section-container relative">
        <div className="reveal mx-auto mb-9 max-w-3xl text-center">
          <h2 className="section-title">{section.title}</h2>
          <p className="section-copy mx-auto">
            {section.description}
          </p>
        </div>

        <div className="space-y-7 lg:space-y-9">
          <article className={partnerGroupClass}>
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{government.title}</h3>
            </div>
            <div className="marquee-mask government-marquee relative overflow-hidden rounded-[22px] py-1" aria-label="شعارات الجهات الحكومية">
              <div className="marquee-track">
                {governmentGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="marquee-group" aria-hidden={groupIndex > 0 || undefined}>
                    {group.map((partner) => (
                      <LogoCell
                        key={`${partner.name}-${groupIndex}`}
                        partner={partner}
                        hidden={groupIndex > 0}
                        className="government-logo-cell min-h-[128px] shrink-0 p-4 lg:min-h-[138px]"
                        imageClassName="max-h-[96px]"
                        imageWidth={300}
                        imageHeight={150}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className={partnerGroupClass} data-delay="1">
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{finance.title}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
              {financeItems.map((partner) => (
                <LogoCell
                  key={partner.name}
                  partner={partner}
                  className="min-h-[128px] p-4 lg:min-h-[138px]"
                  imageClassName="max-h-[96px]"
                  imageWidth={300}
                  imageHeight={150}
                />
              ))}
            </div>
          </article>

          <article className={partnerGroupClass} data-delay="2">
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{exhibitors.title}</h3>
            </div>
            <div className="marquee-mask relative overflow-hidden rounded-[22px] py-1" aria-label="شعارات العارضين">
              <div className="marquee-track">
                {exhibitorGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="marquee-group" aria-hidden={groupIndex > 0 || undefined}>
                    {group.map((partner) => (
                      <LogoCell
                        key={`${partner.name}-${groupIndex}`}
                        partner={partner}
                        hidden={groupIndex > 0}
                        className="min-h-[128px] w-56 shrink-0 p-4"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className={partnerGroupClass} data-delay="3">
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{media.title}</h3>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:me-auto lg:w-[min(100%,1220px)] lg:gap-4">
              {media.items.map((partner) => (
                <LogoCell key={partner.name} partner={partner} className="min-h-[128px] p-4 lg:min-h-[138px]" />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
