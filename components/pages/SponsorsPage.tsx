"use client";

import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Crown,
  ExternalLink,
  Gem,
  Globe,
  IdCard,
  MailOpen,
  Medal,
  Megaphone,
  MessageSquare,
  Share2,
  Star,
  Store,
  Ticket,
  UserRoundCheck,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SiteContent } from "@/data/site";
import { cn } from "@/components/ui/cn";

type SponsorsPageProps = {
  site: SiteContent;
};

const sponsorIcons: Record<string, LucideIcon> = {
  globe: Globe,
  megaphone: Megaphone,
  mail: MailOpen,
  share: Share2,
  "id-card": IdCard,
  store: Store,
  vip: UserRoundCheck,
  ticket: Ticket,
  book: BookOpen,
  video: Video,
  award: Award,
  chart: BarChart3,
  star: Star,
  medal: Medal,
  gem: Gem,
  crown: Crown,
  message: MessageSquare,
  arrow: ArrowLeft,
};

function SponsorIcon({ name, className }: { name: string; className?: string }) {
  const Icon = sponsorIcons[name] ?? BriefcaseBusiness;

  return <Icon className={className} size={22} strokeWidth={2.4} aria-hidden="true" />;
}

function linkTarget(href: string) {
  return /^https?:\/\//.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function SponsorsPage({ site }: SponsorsPageProps) {
  const page = site.secondaryPages.sponsors;
  const firstTierKey = page.tiers[0]?.key ?? "";
  const [activeTierKey, setActiveTierKey] = useState(firstTierKey);
  const activeTier = useMemo(
    () => page.tiers.find((tier) => tier.key === activeTierKey) ?? page.tiers[0],
    [activeTierKey, page.tiers],
  );

  return (
    <section id="seredo-sponsors-section" dir="rtl">
      <section className="page sponsors" id="seredo-sponsors">
        <div className="container">
          <section className="sponsor-benefits" aria-labelledby="sponsors-benefits-title">
            <div className="sponsor-benefits-head">
              <div>
                <h1 id="sponsors-benefits-title">{page.title}</h1>
              </div>

              <p>{page.description}</p>
            </div>

            <div className="benefits-icons-grid">
              {page.benefits.map((benefit, index) => (
                <div className="benefit-icon-card" key={`${benefit.label}-${index}`}>
                  <span className="seredo-sponsor-icon">
                    <SponsorIcon name={benefit.icon} />
                  </span>
                  <span>{benefit.label}</span>
                </div>
              ))}
            </div>

            {page.tiers.length > 0 ? (
              <div className="tier-tabs-wrap">
                <div className="tier-tabs" role="tablist" aria-label="فئات الرعاية">
                  {page.tiers.map((tier) => {
                    const isActive = tier.key === activeTier?.key;

                    return (
                      <button
                        className={cn("tier-tab", isActive && "is-active")}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`tier-panel-${tier.key}`}
                        id={`tier-tab-${tier.key}`}
                        key={tier.key}
                        onClick={() => setActiveTierKey(tier.key)}
                      >
                        <span className="seredo-sponsor-icon">
                          <SponsorIcon name={tier.icon} />
                        </span>
                        {tier.tabLabel}
                      </button>
                    );
                  })}
                </div>

                {page.tiers.map((tier) => {
                  const isActive = tier.key === activeTier?.key;

                  return (
                    <article
                      className={cn("tier-panel", isActive && "is-active")}
                      id={`tier-panel-${tier.key}`}
                      role="tabpanel"
                      aria-labelledby={`tier-tab-${tier.key}`}
                      key={tier.key}
                    >
                      <div className="tier-panel-inner">
                        <div className="tier-side">
                          <div className="tier-side-content">
                            <div>
                              <div className="tier-side-icon">
                                <SponsorIcon name={tier.icon} />
                              </div>
                              <h2>{tier.title}</h2>
                            </div>
                            <p>{tier.description}</p>
                          </div>
                        </div>

                        <div className="tier-data">
                          <div className="tier-stats">
                            {tier.stats.map((stat, index) => (
                              <div className="tier-stat" key={`${stat.value}-${stat.label}-${index}`}>
                                <b>{stat.value}</b>
                                <span>{stat.label}</span>
                              </div>
                            ))}
                          </div>

                          <div className="tier-mini-benefits">
                            {tier.miniBenefits.map((benefit, index) => (
                              <div className="tier-mini" key={`${benefit.label}-${index}`}>
                                <span className="seredo-sponsor-icon">
                                  <SponsorIcon name={benefit.icon} />
                                </span>
                                <span>{benefit.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </section>

          <div className="cta-stripe">
            <h2>{page.ctaTitle}</h2>

            <div className="cta-buttons">
              {page.ctaButtons.map((button, index) => (
                <a className="btn" href={button.href} key={`${button.label}-${index}`} {...linkTarget(button.href)}>
                  {button.label}
                  <SponsorIcon name={button.icon || "arrow"} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
