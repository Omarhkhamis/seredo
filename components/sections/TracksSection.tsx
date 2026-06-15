import { ArrowLeft, Building2, Handshake, UserRound } from "lucide-react";
import { tracks } from "@/data/site";

const trackIcons = [Building2, UserRound, Handshake];

export function TracksSection() {
  return (
    <section id="seredo-register" className="section-pad bg-gradient-to-b from-surface to-mist">
      <div className="section-container">
        <div className="reveal mx-auto mb-12 max-w-4xl text-center">
          <h2 className="section-title">حيث تلتقي الفرص العقارية بصنّاع القرار</h2>
          <p className="section-copy mx-auto">
            منصة عقارية متخصصة تجمع المطورين العقاريين، المستثمرين، جهات التمويل، والخبراء في بيئة مهنية تُمكّن من بناء الشراكات واستكشاف الفرص الاستثمارية.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {tracks.map((track, index) => {
            const Icon = trackIcons[index] ?? Building2;

            return (
              <a
                key={track.title}
                className="reveal surface-card group flex min-h-64 flex-col p-7"
                href={track.href}
                data-delay={String(index)}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-700 text-white shadow-soft">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-2xl text-ink">{track.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted">{track.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-brand-600">
                  {track.action}
                  <ArrowLeft size={17} className="transition group-hover:-translate-x-1" aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
