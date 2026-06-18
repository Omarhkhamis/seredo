import { ArrowLeft } from "lucide-react";
import { defaultSiteContent, type SiteContent } from "@/data/site";

type SectorsSectionProps = {
  site?: SiteContent;
};

export function SectorsSection({ site = defaultSiteContent }: SectorsSectionProps) {
  const section = site.sectorsSection;

  return (
    <section className="section-pad bg-gradient-to-b from-surface to-mist">
      <div className="section-container grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-14">
        <div className="reveal">
          <h2 className="section-title">{section.title}</h2>
          <p className="section-copy">
            {section.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {section.items.map((sector, index) => (
            <div key={sector} className="reveal flex items-center gap-3 rounded-lg border border-line bg-white p-4 shadow-sm transition hover:border-brand-600/25 hover:bg-surface" data-delay={String(index % 5)}>
              <span className="w-9 font-display text-xl font-black text-brand-300">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-sm font-extrabold text-ink sm:text-base">{sector}</span>
              <ArrowLeft size={17} className="text-brand-600" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
