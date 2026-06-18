import Image from "next/image";
import { ArrowUp, CalendarDays, Clock3, Link as LinkIcon, Mail, MapPin, Phone, Tag } from "lucide-react";
import type { SVGProps } from "react";
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

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.9 10.47 21.35 2h-1.77l-6.47 7.35L7.95 2H2l7.81 11.12L2 22h1.77l6.82-7.75L16.05 22H22l-8.1-11.53Zm-2.42 2.75-.79-1.1-6.3-8.82h2.71l5.08 7.1.79 1.1 6.61 9.25h-2.71l-5.39-7.53Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.88H3.5V20h3.44V8.88ZM5.22 4a2 2 0 1 0 0 4.01 2 2 0 0 0 0-4.01Zm15.28 9.64c0-3.25-1.74-4.77-4.06-4.77a3.49 3.49 0 0 0-3.15 1.73h-.05V8.88H9.95V20h3.43v-5.5c0-1.45.28-2.86 2.08-2.86 1.77 0 1.79 1.66 1.79 2.95V20h3.43l-.18-6.36Z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.96-1.97C18.85 4 12 4 12 4s-6.85 0-8.58.45a2.78 2.78 0 0 0-1.96 1.97A29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.96 1.97C5.15 20 12 20 12 20s6.85 0 8.58-.45a2.78 2.78 0 0 0 1.96-1.97A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-5.58ZM9.8 15.43V8.57L15.5 12l-5.7 3.43Z" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 2c.34 2.6 1.8 4.15 4.4 4.32v3.11a7.52 7.52 0 0 1-4.32-1.34v6.53c0 3.3-2.02 6.38-6.34 6.38-3.46 0-6.34-2.67-6.34-6.06 0-3.78 3.1-6.53 7.03-6.05v3.25c-1.72-.27-3.56.68-3.56 2.72 0 1.56 1.24 2.8 2.83 2.8 1.85 0 2.95-1.08 2.95-3.45V2h3.35Z" />
    </svg>
  );
}

function SocialIcon({ label, short }: { label: string; short?: string }) {
  const key = `${label} ${short ?? ""}`.toLowerCase();
  const iconClass = "h-5 w-5";

  if (key.includes("youtube") || key.includes("yt")) {
    return <YouTubeIcon className={iconClass} />;
  }

  if (key.includes("instagram") || key.includes("ig")) {
    return <InstagramIcon className={iconClass} />;
  }

  if (key.includes("linkedin") || key.includes("in")) {
    return <LinkedInIcon className={iconClass} />;
  }

  if (key.includes("tiktok") || key.includes("tt")) {
    return <TikTokIcon className={iconClass} />;
  }

  if (key.includes("twitter") || key.includes("x")) {
    return <XIcon className={iconClass} />;
  }

  return <LinkIcon size={20} aria-hidden="true" />;
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
                    title={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-teal-300 hover:text-brand-900"
                  >
                    <SocialIcon label={social.label} short={social.short} />
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
