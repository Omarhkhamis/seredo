import Image from "next/image";
import { defaultSiteContent, type SiteContent, type SiteContentPartner } from "@/data/site";

function LogoCell({ partner, hidden = false, className = "" }: { partner: SiteContentPartner; hidden?: boolean; className?: string }) {
  return (
    <div className={`logo-cell ${className}`} aria-hidden={hidden || undefined}>
      <Image
        src={partner.logo}
        alt={hidden ? "" : partner.name}
        width={220}
        height={110}
        className="h-auto max-h-[82px] w-auto object-contain"
      />
    </div>
  );
}

const partnerGroupClass =
  "reveal rounded-[26px] border border-line bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,51,0.075)] sm:rounded-[34px] sm:p-8 lg:rounded-[44px] lg:p-12";

const partnerHeadClass = "mb-6 flex items-center justify-between gap-4 border-b border-line pb-5 lg:mb-8 lg:pb-7";
const partnerTitleClass = "font-display text-[30px] font-black leading-none text-brand-700 sm:text-4xl lg:text-5xl";
const partnerCountClass =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#EEF1F6] px-5 text-sm font-black text-brand-600 sm:min-h-12 sm:text-base lg:min-h-14 lg:px-6 lg:text-lg";

type PartnersSectionProps = {
  site?: SiteContent;
};

export function PartnersSection({ site = defaultSiteContent }: PartnersSectionProps) {
  const section = site.partnersSection;
  const { government, finance, exhibitors, media } = section.groups;
  const exhibitorLoop = [...exhibitors.items, ...exhibitors.items];

  return (
    <section id="seredo-partners" className="section-pad relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(760px_360px_at_8%_16%,rgba(13,92,99,0.055),transparent_62%),radial-gradient(850px_420px_at_85%_0%,rgba(37,57,110,0.08),transparent_62%)]" />
      <div className="partners-wide-container relative">
        <div className="reveal mx-auto mb-12 max-w-3xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {section.eyebrow}
          </span>
          <h2 className="section-title mt-5">{section.title}</h2>
          <p className="section-copy mx-auto">
            {section.description}
          </p>
        </div>

        <div className="space-y-10 lg:space-y-12">
          <article className={partnerGroupClass}>
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{government.title}</h3>
              <span className={partnerCountClass}>{government.countLabel}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
              {government.items.map((partner) => (
                <LogoCell key={partner.name} partner={partner} />
              ))}
            </div>
          </article>

          <article className={partnerGroupClass} data-delay="1">
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{finance.title}</h3>
              <span className={partnerCountClass}>{finance.countLabel}</span>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:me-auto lg:w-[min(100%,1220px)] lg:gap-5">
              {finance.items.map((partner) => (
                <LogoCell key={partner.name} partner={partner} />
              ))}
            </div>
          </article>

          <article className={partnerGroupClass} data-delay="2">
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{exhibitors.title}</h3>
              <span className={partnerCountClass}>{exhibitors.countLabel}</span>
            </div>
            <div className="marquee-mask relative overflow-hidden rounded-[22px] py-1" aria-label="شعارات العارضين">
              <div className="marquee-track hover:[animation-play-state:paused]">
                {exhibitorLoop.map((partner, index) => (
                  <LogoCell
                    key={`${partner.name}-${index}`}
                    partner={partner}
                    hidden={index >= exhibitors.items.length}
                    className="min-h-28 w-44 shrink-0 p-4"
                  />
                ))}
              </div>
            </div>
          </article>

          <article className={partnerGroupClass} data-delay="3">
            <div className={partnerHeadClass}>
              <h3 className={partnerTitleClass}>{media.title}</h3>
              <span className={partnerCountClass}>{media.countLabel}</span>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:me-auto lg:w-[min(100%,1220px)] lg:gap-5">
              {media.items.map((partner) => (
                <LogoCell key={partner.name} partner={partner} />
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
