import Image from "next/image";
import { defaultSiteContent, type SiteContent, type SiteContentPartner } from "@/data/site";

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
  const governmentItems = government.items;
  const financeItems = finance.items;
  const exhibitorItems = exhibitors.items;
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
