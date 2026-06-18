import { ExternalLink } from "lucide-react";
import type { SiteContent } from "@/data/site";

type MediaCoveragePageProps = {
  site: SiteContent;
};

export function MediaCoveragePage({ site }: MediaCoveragePageProps) {
  const page = site.secondaryPages.media;

  return (
    <section className="seredo-media-page" dir="rtl" aria-labelledby="seredo-media-title">
      <div className="seredo-media-wrap">
        <div className="seredo-media-hero">
          <div>
            <h1 id="seredo-media-title">{page.title}</h1>
          </div>
          <p>{page.description}</p>
        </div>

        <div className="seredo-media-stats">
          {page.stats.map((stat, index) => (
            <div className="seredo-stat" key={`${stat.value}-${index}`}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="seredo-media-grid">
          {page.articles.map((article, index) => (
            <a
              href={article.href}
              target="_blank"
              className="seredo-media-card"
              rel="noopener noreferrer"
              key={`${article.href}-${index}`}
            >
              <div className="seredo-media-img">
                <img src={article.image} alt={article.alt || article.title} loading="lazy" decoding="async" />
              </div>

              <div className="seredo-media-content">
                <span className="seredo-media-source">{article.source}</span>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <span className="seredo-read-more">
                  {page.readMoreLabel}
                  <ExternalLink size={15} aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
