import Image from "next/image";
import { ArrowUp, CalendarDays, Clock3, Mail, MapPin, Phone, Tag } from "lucide-react";
import { defaultSiteContent, type SiteContent } from "@/data/site";

const contactIcons = [Phone, Mail, MapPin, MapPin];
const eventIcons = [CalendarDays, Clock3, Tag];

type FooterProps = {
  site?: SiteContent;
};

function linkTarget(href?: string) {
  return href?.startsWith("http") ? "_blank" : undefined;
}

function linkRel(href?: string) {
  return href?.startsWith("http") ? "noopener noreferrer" : undefined;
}

export function Footer({ site = defaultSiteContent }: FooterProps) {
  const { assets, footer, socialLinks } = site;

  return (
    <footer className="bg-brand-900 text-white">
      <div className="section-container">
        <div className="grid gap-10 py-14 lg:grid-cols-[1.25fr_1fr_1fr_0.9fr] lg:gap-14 lg:py-20">
          <div>
            <a className="inline-flex min-h-24 w-64 max-w-full items-center justify-center rounded-lg bg-white p-4 shadow-strong" href="#seredo-top" aria-label="سيريدو">
              <Image src={assets.logo} alt={footer.logoAlt} width={230} height={90} className="max-h-16 w-auto object-contain" />
            </a>
            <p className="mt-5 max-w-md text-sm leading-8 text-white/70 sm:text-base">
              {footer.description}
            </p>

            <div className="mt-6">
              <h3 className="text-base text-white">{footer.followTitle}</h3>
              <div className="mt-3 flex flex-wrap gap-2" aria-label={footer.socialLabel}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-white transition hover:bg-teal-300 hover:text-brand-900"
                  >
                    {social.short}
                  </a>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="flex min-h-14 w-32 items-center justify-center rounded-lg bg-white p-2">
                  <Image src={assets.venueLogo} alt={footer.venueLogoAlt} width={120} height={48} className="max-h-10 w-auto object-contain" />
                </span>
                <span className="flex min-h-14 w-32 items-center justify-center rounded-lg bg-white p-2">
                  <Image src={assets.organizerLogo} alt={footer.organizerLogoAlt} width={120} height={48} className="max-h-10 w-auto object-contain" />
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xl text-white">{footer.contactTitle}</h3>
            <address className="not-italic">
              <ul className="grid gap-4 text-sm leading-7 text-white/80">
                {footer.contactItems.map((item, index) => {
                  const Icon = contactIcons[index] ?? MapPin;

                  return (
                    <li className="flex gap-3" key={`${item.label}-${item.value}`}>
                      <Icon size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                      {item.href ? (
                        <a
                          href={item.href}
                          target={linkTarget(item.href)}
                          rel={linkRel(item.href)}
                          className="transition hover:text-white"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span>{item.value}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </address>
          </div>

          <div>
            <h3 className="mb-5 text-xl text-white">{footer.eventTitle}</h3>
            <ul className="grid gap-4 text-sm leading-7 text-white/80">
              {footer.eventItems.map((item, index) => {
                const Icon = eventIcons[index] ?? Tag;

                return (
                  <li className="flex gap-3" key={`${item.label}-${item.value}`}>
                    <Icon size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                    <span>{item.value}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xl text-white">{footer.linksTitle}</h3>
            <nav aria-label="روابط الموقع">
              <ul className="grid gap-3 text-sm font-bold text-white/80">
                {footer.navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-white/10 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyright}</p>
          <a className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold text-white transition hover:bg-white/10" href="#seredo-top">
            <ArrowUp size={16} aria-hidden="true" />
            {footer.backToTopLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
