import type { SiteContent } from "@/data/site";
import { RegistrationForm } from "@/components/pages/RegistrationForm";

type RegistrationPagesProps = {
  site: SiteContent;
};

export function VisitorsRegistrationPage({ site }: RegistrationPagesProps) {
  const page = site.secondaryPages.visitors;

  return (
    <section id="seredo-visitor-register" dir="rtl" aria-labelledby="visitors-register-title">
      <div className="wrap">
        <div className="content">
          <h1 id="visitors-register-title">{page.title}</h1>
          <p className="lead">{page.lead}</p>

          <div className="steps">
            {page.steps.map((step, index) => (
              <article className="step" key={`${step.title}-${index}`}>
                <div className="num">{index + 1}</div>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="note">{page.note}</div>
        </div>

        <div className="form-side">
          <RegistrationForm type="visitor" logoSrc={site.assets.logo} />
        </div>
      </div>
    </section>
  );
}

export function ExhibitorsRegistrationPage({ site }: RegistrationPagesProps) {
  const page = site.secondaryPages.exhibitors;

  return (
    <section id="seredo-exhibitor-register" dir="rtl" aria-labelledby="exhibitors-register-title">
      <div className="top-panel">
        <h1 id="exhibitors-register-title">{page.topPanelTitle}</h1>
      </div>

      <div className="form-wrap">
        <RegistrationForm type="exhibitor" logoSrc={site.assets.logo} />
      </div>
    </section>
  );
}
