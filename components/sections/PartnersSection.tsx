import Image from "next/image";
import { defaultSiteContent, type SiteContent, type SiteContentPartner } from "@/data/site";

const governmentLogoUrls = [
  "https://seredoexpo.sa/wp-content/uploads/2026/06/MINISTRY-OF-HOUSING_6-scaled-e1781591519236.jpg",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/NHC_Logo_NTLGreen_H_RGB.png",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/Untitled-22-يونيو-2026-في-12.10.44.png",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/شعار-غرفة-جدة__page-0001-scaled-e1781591478427.jpg",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/Jeddah-Municipality-Logo_page-0001-scaled-e1781591459845.jpg",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/REGA-LOGO_page-0001-scaled.jpg",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/60409-e1781591431483.jpg",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/MAKKAH-CHAMBER-OF-COMMERCE-LOGO.png",
] as const;

const financeLogoUrls = [
  "https://seredoexpo.sa/wp-content/uploads/2026/06/ALINMA-BANK-Logo-CMYK-2-scaled.png",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/ANB-LOGO-4M-BANK-e1781594579153.png",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/SNB_Brandmark-Artwork_CMYK_Primary.png",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/Logo-.png",
  "https://seredoexpo.sa/wp-content/uploads/2026/06/Bank_Albilad_logo.svg_.png",
] as const;

const exhibitorLogoUrls = [
  "https://i.postimg.cc/sDHTQKQm/000.png",
  "https://i.postimg.cc/kXYT6w6Y/ADERA-LOGO-D35.jpg",
  "https://i.postimg.cc/rFZf0g0f/ADL-logo-7x7.png",
  "https://i.postimg.cc/jd3MwvwF/AFAQ-Logo-2024.png",
  "https://i.postimg.cc/VLZKr4rp/AL-RASIYAT-LOGO.png",
  "https://i.postimg.cc/jd3Mwvw9/AL-WADAD.png",
  "https://i.postimg.cc/WbY5FSqc/Al-Zaidy-Logo.png",
  "https://i.postimg.cc/4N2W7w70/ALKOBARAH.jpg",
  "https://i.postimg.cc/fTq8t5tG/Alzamiliah-Logo-1.png",
  "https://i.postimg.cc/X71sGxBb/Amkn-Logos-Horizontal-orange-6.png",
  "https://i.postimg.cc/2890bTLR/AMMAR-BATTERJEE-LOGO.jpg",
  "https://i.postimg.cc/VLZKr401/ANAN-GOLDEN-REAL-ESTATE-D22.png",
  "https://i.postimg.cc/yYpLgn37/ANSAQ-LOGO.png",
  "https://i.postimg.cc/13gJp6D4/AQAR-D40-LOGO.png",
  "https://i.postimg.cc/hPZ2zMQS/ARACO-ALRAM-CO-LOGO.png",
  "https://i.postimg.cc/RZ3Xcfwm/ARBAH-TAIBAH-C8-(2).png",
  "https://i.postimg.cc/52Hnwv8W/ARKAN-ALBEIT-LOGO.png",
  "https://i.postimg.cc/cLKXQYfS/ASALA-AL-KHALEEJ.jpg",
  "https://i.postimg.cc/htJp9xV4/ASALA-AL-KHALEEJ.png",
  "https://i.postimg.cc/wjt0hJD6/ATMAM-GULF-E6.png",
  "https://i.postimg.cc/fR3BxXYM/AWTADA.jpg",
  "https://i.postimg.cc/JzyPbJjs/AYEN-D46.png",
  "https://i.postimg.cc/8zFthWLC/blacklogo.png",
  "https://i.postimg.cc/vZ13W95x/DARA-LOGOS-D49-1.png",
  "https://i.postimg.cc/6pDzz3h1/Darah-by-ajdan-B16.png",
  "https://i.postimg.cc/DwWBqs1L/FIRST-CLASS-LOGO.jpg",
  "https://i.postimg.cc/QdRSStqB/Innovest-Logo-(3).png",
  "https://i.postimg.cc/kgVfx8WW/JAS-LOGO-D11.png",
  "https://i.postimg.cc/SxwVVsGn/Jenan-logo-uplifted.png",
  "https://i.postimg.cc/8zqww5bh/KAYAN-CAPITAL-LOGO.png",
  "https://i.postimg.cc/wjSFFvkR/KAYAN-UNITED-TATWIR-LOGO.png",
  "https://i.postimg.cc/XYTxxJgF/KAYANAT-D9.png",
  "https://i.postimg.cc/MphttTYB/KAYANAT-FOR-REAL-ESTATE-LOGO.png",
  "https://i.postimg.cc/Jz9KKnQ3/KETAF-D36.png",
  "https://i.postimg.cc/wjSFFvkD/KIRAA-D15.png",
  "https://i.postimg.cc/Z51jjRLV/Logo.jpg",
  "https://i.postimg.cc/7ZpXX6NK/Logo.png",
  "https://i.postimg.cc/d0r6fYWf/m-logo-2.png",
  "https://i.postimg.cc/BndNN6Cp/MAKKIYOON-LOGO1.png",
  "https://i.postimg.cc/GmZzz2jf/MANAZEL-AL-SHOLA-LOGO.png",
  "https://i.postimg.cc/GmZzz2j5/MARIJ-C17.png",
  "https://i.postimg.cc/9Qv11MBS/MASAR-FINANCE-LOGO.jpg",
  "https://i.postimg.cc/Hkf33xtF/MASAR-LOGO.png",
  "https://i.postimg.cc/BvHpz0hN/MAYA.png",
  "https://i.postimg.cc/s27mLrnw/Miskan-Logo-open-ai-preview.jpg",
  "https://i.postimg.cc/tgWkcjrB/MORJAN-LOGO.png",
  "https://i.postimg.cc/R0KdYBPD/NOKHBAT-AL-MBANI.png",
  "https://i.postimg.cc/d0r6fYWX/OSUS-AL-INSHA.png",
  "https://i.postimg.cc/xdM5Z2sh/OSUS-LAW-LOGO.png",
  "https://i.postimg.cc/bvkg5hCw/PAN-KINGDOM-LOGO.png",
  "https://i.postimg.cc/GpGKfC73/RABEEZ-LOGO.png",
  "https://i.postimg.cc/bvkg5hCj/Rafal.png",
  "https://i.postimg.cc/bvkg5hCh/RASEEN-LOGO.png",
  "https://i.postimg.cc/ZqpHQS7J/RAWASI-LOGO.webp",
  "https://i.postimg.cc/FK3p64Ws/RAWASI-LOGO.png",
  "https://i.postimg.cc/tgWkcjST/Real-Estate-Logo.png",
  "https://i.postimg.cc/bJPgcBWP/REBA-REAL-ESTATE-LOGO1.png",
  "https://i.postimg.cc/tTbkQMwH/RETAL-LOGO.jpg",
  "https://i.postimg.cc/MTw52FNn/RETAL-LOGO-1.png",
  "https://i.postimg.cc/j5Tc0FmL/S-S-LOGO-AR.png",
  "https://i.postimg.cc/gJpsFTQc/SABQON-LOGO.jpg",
  "https://i.postimg.cc/W3V8LHCq/SAKAN-A1.png",
  "https://i.postimg.cc/Y97RKsZg/Salama-Logo.png",
  "https://i.postimg.cc/j5Tc0Fm6/SANADAK-D17-1.png",
  "https://i.postimg.cc/RhVTqnMS/SAR-D2.png",
  "https://i.postimg.cc/bJPgcBW1/Screenshot-2026-06-09-142411.png",
  "https://i.postimg.cc/cHWhyb2Q/SHIFTED-LOGO-1.png",
  "https://i.postimg.cc/rmTjXP3C/SMART-BLDG-D28.jpg",
  "https://i.postimg.cc/LXVTHVFf/SUWAR-D26.png",
  "https://i.postimg.cc/XJg8Vg6y/TAHQIQ-ALAMAL-LOGO-1.png",
  "https://i.postimg.cc/sXJcVJCY/tatwir-logo-Flag.png",
  "https://i.postimg.cc/B6CgqCfx/Thabat-Logo.png",
  "https://i.postimg.cc/JnQq1QCx/THIQA-LOGO.png",
  "https://i.postimg.cc/C5L4dfFK/Tilal-khuzam-logo.png",
  "https://i.postimg.cc/4yN1nhXq/TILAL-REAL-ESTATE-LOGO.png",
  "https://i.postimg.cc/C14NF4pr/TUWAIQ-LOGO.jpg",
  "https://i.postimg.cc/63h09hxS/Whats-App-Image-2025-08-03-at-15-46-57.jpg",
  "https://i.postimg.cc/FRxZ9xQX/Whats-App-Image-2025-08-31-at-19-06-41.jpg",
  "https://i.postimg.cc/90FBzqcs/Ydar-FLA-2-(1)-1.png",
  "https://i.postimg.cc/4yN1nhXr/ZAM-ZAM-LOGO.jpg",
  "https://i.postimg.cc/j2dhCJsT/ZAMAKAN-D12.png",
  "https://i.postimg.cc/tJCz7VXy/ZUKHRUF-D13-1.png",
  "https://i.postimg.cc/yxYTWSVk/ard.png",
  "https://i.postimg.cc/d3t9DTq1/shʿar-albrnamj-alwtny-lltshjyr.png",
  "https://i.postimg.cc/6q5hTG98/shʿar-hwst.png",
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
