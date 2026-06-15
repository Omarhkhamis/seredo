import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";
import { assets, links } from "@/data/site";
import { Countdown } from "@/components/ui/Countdown";

export function HeroSection() {
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
              alt="لقطة علوية من معرض سيريدو تظهر أجنحة العارضين وزوار المعرض"
              fill
              priority
              loading="eager"
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,51,0.68),rgba(15,23,51,0.18)_44%,rgba(15,23,51,0.04))]" />
            <figcaption className="absolute inset-x-6 top-12 text-center text-white sm:inset-x-9">
              <h2 className="font-display text-2xl font-black leading-tight text-white sm:text-3xl">حيث تلتقي العمارة بالاستثمار</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                منصة عقارية واستثمارية مصممة لخلق فرص أعمال حقيقية وروابط استراتيجية بين قادة القطاع.
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="order-1 text-center lg:text-right">
          <h1
            id="hero-title"
            className="reveal mx-auto max-w-[820px] font-display text-[clamp(38px,4.2vw,68px)] font-black leading-[1.15] text-brand-900 lg:mx-0"
          >
            معرض سيريدو للتطوير والتمليك العقاري - بدورته الخامسة
          </h1>

          <p className="reveal mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 lg:mx-0 lg:text-lg" data-delay="1">
            معرض عقاري واستثماري متخصص يجمع المطورين، المستثمرين، جهات التمويل، والخبراء في منصة واحدة.
          </p>

          <div className="reveal mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-bold text-slate-800 lg:justify-start">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={19} className="text-brand-600" aria-hidden="true" />
              من 6 - 8 سبتمبر 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 size={19} className="text-brand-600" aria-hidden="true" />
              مدة الفعالية 3 أيام
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={19} className="text-brand-600" aria-hidden="true" />
              جدة
            </span>
          </div>

          <div className="reveal mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" data-delay="2">
            <a className="btn btn-primary min-h-[58px] px-8 text-base" href={links.visitorRegistration}>
              سجّل كزائر
              <ArrowLeft size={18} aria-hidden="true" />
            </a>
            <a className="btn btn-outline min-h-[58px] bg-white/70 px-8 text-base" href={links.exhibitorRegistration}>
              سجّل كعارض
            </a>
          </div>

          <div className="reveal mx-auto mt-9 max-w-[700px] lg:mx-0" data-delay="3">
            <Countdown />
          </div>
        </div>
      </div>
    </section>
  );
}
