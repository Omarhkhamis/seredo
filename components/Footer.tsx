import Image from "next/image";
import { ArrowUp, CalendarDays, Clock3, Mail, MapPin, Phone, Tag } from "lucide-react";
import { assets, links, socialLinks } from "@/data/site";

const footerLinks = [
  { label: "الزوار", href: links.visitorsPage },
  { label: "الرعايات", href: links.sponsorsPage },
  { label: "العارضون", href: links.exhibitorsPage },
  { label: "عن سيريدو", href: "#seredo-about" },
  { label: "تواصل معنا", href: links.whatsapp },
  { label: "سياسة الخصوصية", href: links.privacy },
];

export function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="section-container">
        <div className="grid gap-10 py-14 lg:grid-cols-[1.25fr_1fr_1fr_0.9fr] lg:gap-14 lg:py-20">
          <div>
            <a className="inline-flex min-h-24 w-64 max-w-full items-center justify-center rounded-lg bg-white p-4 shadow-strong" href="#seredo-top" aria-label="سيريدو">
              <Image src={assets.logo} alt="SEREDO Expo" width={230} height={90} className="max-h-16 w-auto object-contain" />
            </a>
            <p className="mt-5 max-w-md text-sm leading-8 text-white/70 sm:text-base">
              سيريدو للتطوير والتمليك العقاري - منصة عقارية متخصصة تجمع المطورين، المستثمرين، جهات التمويل، والخبراء في تجربة مهنية متكاملة.
            </p>

            <div className="mt-6">
              <h3 className="text-base text-white">تابعنا على</h3>
              <div className="mt-3 flex flex-wrap gap-2" aria-label="حسابات سيريدو على مواقع التواصل الاجتماعي">
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
                  <Image src={assets.venueLogo} alt="جدة سوبر دوم" width={120} height={48} className="max-h-10 w-auto object-contain" />
                </span>
                <span className="flex min-h-14 w-32 items-center justify-center rounded-lg bg-white p-2">
                  <Image src={assets.organizerLogo} alt="رواد الفعاليات" width={120} height={48} className="max-h-10 w-auto object-contain" />
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xl text-white">تواصل معنا</h3>
            <address className="not-italic">
              <ul className="grid gap-4 text-sm leading-7 text-white/80">
                <li className="flex gap-3">
                  <Phone size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                  <a href={links.phone} className="transition hover:text-white">
                    +966580080464
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                  <a href={links.email} className="transition hover:text-white">
                    info@eventify-organizer.com
                  </a>
                </li>
                <li className="flex gap-3">
                  <MapPin size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                  <span>جدة - المملكة العربية السعودية</span>
                </li>
                <li className="flex gap-3">
                  <MapPin size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                  <a href={links.footerMap} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                    جدة - قاعة سوبر دوم
                  </a>
                </li>
              </ul>
            </address>
          </div>

          <div>
            <h3 className="mb-5 text-xl text-white">الحدث</h3>
            <ul className="grid gap-4 text-sm leading-7 text-white/80">
              <li className="flex gap-3">
                <CalendarDays size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                <span>6 - 8 سبتمبر 2026</span>
              </li>
              <li className="flex gap-3">
                <Clock3 size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                <span>2:00 - 10:00 مساء</span>
              </li>
              <li className="flex gap-3">
                <Tag size={18} className="mt-1 text-teal-300" aria-hidden="true" />
                <span>معرض عقاري واستثماري</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xl text-white">روابط الموقع</h3>
            <nav aria-label="روابط الموقع">
              <ul className="grid gap-3 text-sm font-bold text-white/80">
                {footerLinks.map((link) => (
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
          <p>© 2026 سيريدو - جميع الحقوق محفوظة</p>
          <a className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold text-white transition hover:bg-white/10" href="#seredo-top">
            <ArrowUp size={16} aria-hidden="true" />
            العودة للأعلى
          </a>
        </div>
      </div>
    </footer>
  );
}
