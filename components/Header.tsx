"use client";

import Image from "next/image";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@/data/site";
import { cn } from "@/components/ui/cn";

type HeaderProps = {
  site?: SiteContent;
};

function normalizeInternalHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export function Header({ site = defaultSiteContent }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const { assets, header, links } = site;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-brand-600/10 bg-surface/95 backdrop-blur-xl transition duration-300",
        isScrolled && "shadow-soft",
      )}
    >
      <div className="section-container grid h-[78px] grid-cols-[auto_auto] items-center justify-between gap-4 lg:h-[104px] lg:grid-cols-[auto_1fr_auto] lg:gap-7">
        <a
          href="/#seredo-top"
          aria-label="سيريدو"
          className="flex min-w-0 items-center"
          onClick={() => setIsOpen(false)}
        >
          {logoFailed ? (
            <span className="font-display text-xl font-black text-brand-700">{header.fallbackLogoText}</span>
          ) : (
            <Image
              src={assets.logo}
              alt={header.logoAlt}
              width={210}
              height={80}
              priority
              className="h-11 w-auto object-contain lg:h-[60px]"
              onError={() => setLogoFailed(true)}
            />
          )}
        </a>

        <nav
          aria-label="القائمة الرئيسية"
          className={cn(
            "absolute left-3 right-3 top-[86px] rounded-lg border border-brand-600/10 bg-white p-3 shadow-strong transition lg:static lg:block lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
            isOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0 lg:pointer-events-auto lg:translate-y-0 lg:opacity-100",
            )}
        >
          <ul className="grid gap-2 lg:flex lg:items-center lg:justify-center lg:gap-7">
            {header.navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={normalizeInternalHref(item.href)}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-extrabold text-ink transition hover:bg-brand-50 hover:text-brand-700 lg:min-h-0 lg:bg-transparent lg:px-0 lg:text-base lg:hover:bg-transparent"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          <a className="btn btn-outline min-h-[58px] px-8 text-base" href={links.visitorsPage}>
            {header.visitorButton}
          </a>
          <a className="btn btn-primary min-h-[58px] px-9 text-base" href={links.exhibitorsPage}>
            {header.exhibitorButton}
            <ArrowLeft size={18} aria-hidden="true" />
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft lg:hidden"
          aria-label={isOpen ? header.menuCloseLabel : header.menuOpenLabel}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
