import { deepAbout } from "@/data/site";

const sideStats = [
  { value: "5", label: "دورات متتالية من الحضور المتنامي والتوسع المستمر" },
  { value: "3 أيام", label: "برنامج متكامل من العرض، اللقاءات، والمحتوى المعرفي" },
  { value: "جدة", label: "قلب القطاع العقاري في المملكة العربية السعودية", dark: true },
];

export function DeepAboutSection() {
  return (
    <section className="section-pad bg-white">
      <div className="section-container grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
        <div className="reveal">
          <h2 className="section-title">وجهة تجمع بين المستثمرين والمطورين والمهتمين بالقطاع العقاري</h2>
          <p className="mt-6 text-base leading-9 text-ink/90 sm:text-lg">{deepAbout.intro}</p>

          <h3 className="mt-9 text-2xl text-ink">عن سيريدو</h3>
          <div className="mt-4 space-y-5 text-base leading-9 text-ink/90 sm:text-lg">
            {deepAbout.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <aside className="reveal grid gap-3 lg:sticky lg:top-28 lg:self-start" data-delay="2">
          {sideStats.map((item) => (
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
