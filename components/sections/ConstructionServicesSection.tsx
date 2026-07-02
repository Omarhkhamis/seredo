import { defaultSiteContent, type SiteContent } from "@/data/site";

type ConstructionServicesSectionProps = {
  site?: SiteContent;
};

export function ConstructionServicesSection({ site = defaultSiteContent }: ConstructionServicesSectionProps) {
  const section = site.constructionServicesSection;
  const groups = [section.items, section.items];

  if (section.items.length === 0) {
    return null;
  }

  return (
    <section id="seredo-construction-services" className="seredo-partners-section">
      <div className="seredo-title">{section.title}</div>

      <div className="section-container">
        <div className="marquee-mask fifth-cycle-marquee relative overflow-hidden rounded-[22px] py-1" aria-label={section.title}>
          <div className="marquee-track">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="marquee-group" aria-hidden={groupIndex > 0 || undefined}>
                {group.map((item) => (
                  <div
                    key={`${item.name}-${groupIndex}`}
                    className="logo-cell fifth-cycle-logo-cell min-h-[128px] shrink-0 p-4 lg:min-h-[138px]"
                  >
                    <img
                      src={item.logo}
                      alt={groupIndex > 0 ? "" : item.name}
                      loading="lazy"
                      decoding="async"
                      className="h-auto max-h-[96px] w-auto max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
