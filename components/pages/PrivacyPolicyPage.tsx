import { Mail, Phone, ShieldCheck } from "lucide-react";
import type { SiteContent } from "@/data/site";

type PrivacyPolicyPageProps = {
  site: SiteContent;
};

function splitParagraphs(value: string) {
  return value
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function contactIcon(label: string) {
  return label.includes("هاتف") || label.includes("جوال") ? Phone : Mail;
}

export function PrivacyPolicyPage({ site }: PrivacyPolicyPageProps) {
  const page = site.secondaryPages.privacy;

  return (
    <section className="seredo-privacy-page" dir="rtl" aria-labelledby="privacy-title">
      <div className="section-container">
        <div className="seredo-privacy-hero">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            {page.eyebrow}
          </span>
          <h1 id="privacy-title">{page.title}</h1>
          <p>{page.description}</p>

          <div className="seredo-privacy-meta">
            <ShieldCheck size={20} aria-hidden="true" />
            <span>{page.updatedLabel}</span>
            <strong>{page.updatedAt}</strong>
          </div>
        </div>

        <div className="seredo-privacy-layout">
          <aside className="seredo-privacy-summary">
            <h2>{page.eyebrow}</h2>
            <p>{page.intro}</p>
          </aside>

          <div className="seredo-privacy-content">
            {page.sections.map((section, index) => (
              <article className="seredo-privacy-section" key={`${section.title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.title}</h2>
                  {splitParagraphs(section.body).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}

            <section className="seredo-privacy-contact" aria-labelledby="privacy-contact-title">
              <div>
                <h2 id="privacy-contact-title">{page.contactTitle}</h2>
                <p>{page.contactDescription}</p>
              </div>

              <div className="seredo-privacy-contact-links">
                {page.contactItems.map((item) => {
                  const Icon = contactIcon(item.label);

                  return (
                    <a href={item.href} key={`${item.label}-${item.value}`}>
                      <Icon size={20} aria-hidden="true" />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
