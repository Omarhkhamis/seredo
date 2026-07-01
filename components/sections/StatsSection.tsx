import { defaultSiteContent, type SiteContent } from "@/data/site";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

type StatsSectionProps = {
  site?: SiteContent;
};

export function StatsSection({ site = defaultSiteContent }: StatsSectionProps) {
  const section = site.statsSection;

  return (
    <section className="section-pad relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:54px_54px] opacity-80" />
      <div className="section-container relative">
        <div className="reveal mx-auto mb-10 max-w-3xl text-center">
          <h2 className="mt-5 font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">{section.title}</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {section.items.map((stat, index) => (
            <div key={stat.label} className="reveal rounded-lg border border-white/10 bg-white/5 p-5 text-center backdrop-blur" data-delay={String(index % 5)}>
              <div className="font-display text-4xl font-black leading-none text-white lg:text-5xl">
                <AnimatedCounter value={stat.value} decimals={stat.decimals} />
                {stat.suffix ? <span className="text-teal-300">{stat.suffix}</span> : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
