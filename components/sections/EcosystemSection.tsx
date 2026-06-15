import Image from "next/image";
import { BookOpen, ChartLine, Compass, Handshake, Target } from "lucide-react";
import { assets, ecosystemCards } from "@/data/site";
import { cn } from "@/components/ui/cn";

const cardIcons = [Target, Handshake, ChartLine, BookOpen, Compass];

export function EcosystemSection() {
  return (
    <section className="section-pad bg-gradient-to-b from-surface to-mist">
      <div className="section-container">
        <div className="reveal mb-10 max-w-3xl">
          <h2 className="section-title">منظومة أعمال عقارية متكاملة</h2>
          <p className="section-copy">
            لا يقتصر سيريدو على كونه مساحة لعرض المشاريع العقارية، بل يمثل بيئة متخصصة تجمع بين الاستثمار، المعرفة، العلاقات المهنية، وفرص النمو التجاري.
          </p>
        </div>

        <figure className="reveal relative mb-6 h-[280px] overflow-hidden rounded-lg border border-line shadow-soft sm:h-[380px] lg:h-[430px]" data-delay="1">
          <Image
            src={assets.networkImage}
            alt="لقاء مهني يعبر عن منظومة الأعمال والشراكات في سيريدو"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-brand-900/50 via-brand-900/10 to-transparent" />
        </figure>

        <div className="grid gap-4 md:grid-cols-6">
          {ecosystemCards.map((card, index) => {
            const Icon = cardIcons[index] ?? Target;

            return (
              <article
                key={card.title}
                className={cn(
                  "reveal rounded-lg border p-6 shadow-soft md:min-h-52",
                  index < 2 ? "md:col-span-3" : "md:col-span-2",
                  card.featured
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-line bg-white text-ink",
                )}
                data-delay={String(index % 5)}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-md",
                    card.featured ? "bg-white/10 text-white" : "bg-brand-50 text-brand-700",
                  )}
                >
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h3 className={cn("mt-5 text-xl", card.featured ? "text-white" : "text-ink")}>{card.title}</h3>
                <p className={cn("mt-3 text-sm leading-7", card.featured ? "text-white/70" : "text-muted")}>{card.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
