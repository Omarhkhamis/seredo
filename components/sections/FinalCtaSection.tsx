import { defaultSiteContent, type SiteContent } from "@/data/site";

type FinalCtaSectionProps = {
  site?: SiteContent;
};

function getButtonClass(variant: string) {
  if (variant === "accent") {
    return "btn btn-accent";
  }

  if (variant === "outline") {
    return "btn btn-outline bg-white";
  }

  return "btn btn-primary";
}

export function FinalCtaSection({ site = defaultSiteContent }: FinalCtaSectionProps) {
  const section = site.finalCta;

  return (
    <section id="seredo-contact" className="section-pad border-t border-line bg-surface text-center">
      <div className="section-container">
        <span className="reveal eyebrow">
          <span className="eyebrow-dot" />
          {section.eyebrow}
        </span>
        <h2 className="reveal mx-auto mt-6 max-w-4xl font-display text-4xl font-black leading-tight text-ink sm:text-6xl" data-delay="1">
          {section.title}
        </h2>
        <p className="reveal mx-auto mt-5 max-w-3xl text-base leading-8 text-muted sm:text-xl" data-delay="2">
          {section.description}
        </p>
        <div className="reveal mt-9 flex flex-col justify-center gap-3 sm:flex-row" data-delay="3">
          {section.buttons.map((button) => (
            <a
              className={getButtonClass(button.variant)}
              href={button.href}
              key={`${button.label}-${button.href}`}
              target={button.href.startsWith("http") ? "_blank" : undefined}
              rel={button.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {button.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
