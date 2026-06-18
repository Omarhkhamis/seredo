import { ArrowLeft } from "lucide-react";
import { defaultSiteContent, type SiteContent } from "@/data/site";

type PillarsSectionProps = {
  site?: SiteContent;
};

export function PillarsSection({ site = defaultSiteContent }: PillarsSectionProps) {
  const section = site.pillarsSection;

  return (
    <section className="section-pad bg-white">
      <div className="section-container">
        <div className="reveal mb-10 max-w-3xl">
          <h2 className="section-title">{section.title}</h2>
        </div>

        <div className="border-t border-line" role="list">
          {section.items.map((pillar, index) => (
            <div
              key={pillar}
              className="reveal grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-5 transition hover:bg-surface sm:gap-6 sm:px-3"
              role="listitem"
              data-delay={String(index % 4)}
            >
              <span className="w-12 font-display text-2xl font-black text-brand-300">{String(index + 1).padStart(2, "0")}</span>
              <p className="text-base font-bold leading-8 text-ink/90 sm:text-xl">{pillar}</p>
              <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 sm:flex">
                <ArrowLeft size={18} aria-hidden="true" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
