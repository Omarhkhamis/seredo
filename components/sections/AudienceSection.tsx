import { Building2, Coins, Landmark, PiggyBank, Settings, UsersRound } from "lucide-react";
import { audience } from "@/data/site";

const icons = [Building2, Coins, PiggyBank, UsersRound, Settings, Landmark];

export function AudienceSection() {
  return (
    <section className="section-pad bg-white">
      <div className="section-container">
        <div className="reveal mb-10 max-w-3xl">
          <h2 className="section-title">التقِ بصناع القرار في القطاع العقاري</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {audience.map((item, index) => {
            const Icon = icons[index] ?? Building2;

            return (
              <article key={item.title} className="reveal surface-card p-5" data-delay={String(index % 5)}>
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
