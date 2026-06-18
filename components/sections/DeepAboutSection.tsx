import { defaultSiteContent, type SiteContent } from "@/data/site";

type DeepAboutSectionProps = {
  site?: SiteContent;
};

export function DeepAboutSection({ site = defaultSiteContent }: DeepAboutSectionProps) {
  const section = site.deepAboutSection;

  return (
    <section className="section-pad bg-white">
      <div className="section-container grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
        <div className="reveal">
          <h2 className="section-title">{section.title}</h2>
          <p className="mt-6 text-base leading-9 text-ink/90 sm:text-lg">{section.intro}</p>

          <h3 className="mt-9 text-2xl text-ink">{section.subheading}</h3>
          <div className="mt-4 space-y-5 text-base leading-9 text-ink/90 sm:text-lg">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside className="reveal grid gap-3 lg:sticky lg:top-28 lg:self-start" data-delay="2">
          {section.sideStats.map((item) => (
            <div
              key={item.value}
              className={
                item.dark
                  ? "rounded-lg border border-brand-800 bg-brand-900 p-6 text-white shadow-soft"
                  : "surface-card p-6"
              }
            >
              <div className={item.dark ? "font-display text-4xl font-black text-white" : "font-display text-4xl font-black text-brand-700"}>
                {item.value}
              </div>
              <p className={item.dark ? "mt-2 text-sm leading-7 text-white/70" : "mt-2 text-sm leading-7 text-muted"}>{item.label}</p>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}
