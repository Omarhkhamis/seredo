import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";
import { defaultSiteContent, type SiteContent } from "@/data/site";
import { Countdown } from "@/components/ui/Countdown";

const highlightIcons = [CalendarDays, Clock3, MapPin];

type HeroSectionProps = {
  site?: SiteContent;
};

export function HeroSection({ site = defaultSiteContent }: HeroSectionProps) {
  const { assets, hero } = site;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[#F4F8FC] pb-16 pt-28 text-brand-900 lg:min-h-screen lg:pb-20 lg:pt-[142px]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(37,57,110,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,57,110,0.07) 1px, transparent 1px), radial-gradient(900px 420px at 72% 24%, rgba(255,255,255,0.78), transparent 62%)",
        backgroundSize: "96px 96px, 96px 96px, 100% 100%",
      }}
    >
      <div
        className="relative z-10 mx-auto grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-16"
        style={{ width: "min(1620px, calc(100% - clamp(24px, 6vw, 104px)))" }}
      >
        <div className="reveal order-2 lg:pt-[124px]" data-delay="2">
          <figure className="relative mx-auto aspect-[1.04/1] w-full max-w-[600px] overflow-hidden rounded-[28px] border border-brand-600/10 bg-brand-900 shadow-strong">
            <Image
              src={assets.networkImage}
              alt={hero.imageAlt}
              fill
              priority
              loading="eager"
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,51,0.68),rgba(15,23,51,0.18)_44%,rgba(15,23,51,0.04))]" />
            <figcaption className="absolute inset-x-6 top-12 text-center text-white sm:inset-x-9">
              <h2 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl">{hero.figureTitle}</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                {hero.figureDescription}
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="order-1 text-center lg:text-right">
          <h1
            id="hero-title"
            className="reveal mx-auto max-w-[820px] font-display text-[clamp(38px,4.2vw,68px)] font-black leading-[1.15] text-brand-900 lg:mx-0"
          >
            {hero.title}
          </h1>

          <p className="reveal mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg" data-delay="1">
            {hero.subtitle}
          </p>

          <div className="reveal mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-bold text-slate-800 lg:justify-start">
            {hero.highlights.map((highlight, index) => {
              const Icon = highlightIcons[index] ?? MapPin;

              return (
                <span className="inline-flex items-center gap-2" key={`${highlight}-${index}`}>
                  <Icon size={19} className="text-brand-600" aria-hidden="true" />
                  {highlight}
                </span>
              );
            })}
          </div>

          <div className="reveal mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" data-delay="2">
            <a className="btn btn-primary min-h-[58px] px-8 text-base" href={hero.primaryButton.href}>
              {hero.primaryButton.label}
              <ArrowLeft size={18} aria-hidden="true" />
            </a>
            <a className="btn btn-outline min-h-[58px] bg-white/70 px-8 text-base" href={hero.secondaryButton.href}>
              {hero.secondaryButton.label}
            </a>
          </div>

          <div className="reveal mx-auto mt-9 max-w-[700px] lg:mx-0" data-delay="3">
            <Countdown {...hero.countdown} />
          </div>
        </div>
      </div>
    </section>
  );
}
