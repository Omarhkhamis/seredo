import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { aboutParagraphs, assets, links } from "@/data/site";

export function AboutSection() {
  return (
    <section id="seredo-about" className="section-pad bg-surface">
      <div className="section-container grid gap-10 lg:grid-cols-[1.22fr_0.78fr] lg:gap-16">
        <div className="reveal">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            عن سيريدو
          </span>

          <h2 className="section-title mt-5">منصة عقارية متخصصة بتجربة مهنية متكاملة</h2>

          <div className="mt-6 space-y-5 text-base leading-9 text-ink/90 sm:text-lg">
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8">
            <a className="btn btn-primary" href={links.profile} target="_blank" rel="noopener noreferrer">
              بروفايل معرض سيريدو
              <ArrowLeft size={18} aria-hidden="true" />
            </a>
          </div>
        </div>

        <figure className="reveal relative min-h-[430px] overflow-hidden rounded-lg border border-line shadow-strong lg:min-h-[560px]" data-delay="2">
          <Image
            src={assets.aboutImage}
            alt="لقاء مهني داخل بيئة معرض عقاري يعرض فرص المشاريع والاستثمار"
            fill
            sizes="(min-width: 1024px) 38vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/10 to-transparent" />
          <figcaption className="absolute bottom-5 right-5 text-white">
            <span className="block font-display text-3xl font-black">سيريدو</span>
            <span className="mt-1 block text-sm text-white/75">منصة تجمع القطاع العقاري</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
