import { links } from "@/data/site";

export function FinalCtaSection() {
  return (
    <section id="seredo-contact" className="section-pad border-t border-line bg-surface text-center">
      <div className="section-container">
        <span className="reveal eyebrow">
          <span className="eyebrow-dot" />
          تواصل معنا
        </span>
        <h2 className="reveal mx-auto mt-6 max-w-4xl font-display text-4xl font-black leading-tight text-ink sm:text-6xl" data-delay="1">
          كن جزءاً من الدورة الخامسة لمعرض سيريدو
        </h2>
        <p className="reveal mx-auto mt-5 max-w-3xl text-base leading-8 text-muted sm:text-xl" data-delay="2">
          سجّل حضورك كزائر، أو شارك كعارض أو راعٍ، أو تواصل معنا لاستكشاف فرص التعاون والشراكات الاستراتيجية.
        </p>
        <div className="reveal mt-9 flex flex-col justify-center gap-3 sm:flex-row" data-delay="3">
          <a className="btn btn-primary" href={links.visitorRegistration}>
            سجّل كزائر
          </a>
          <a className="btn btn-accent" href={links.sponsorsPage}>
            كن راعياً
          </a>
          <a className="btn btn-outline bg-white" href={links.whatsapp} target="_blank" rel="noopener noreferrer">
            تواصل معنا
          </a>
        </div>
      </div>
    </section>
  );
}
