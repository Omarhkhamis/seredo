"use client";

import { useEffect } from "react";

export function ClientEffects() {
  useEffect(() => {
    const anchorSelector = 'a[href^="#"]';
    const anchorHandler = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement;
      const id = anchor.getAttribute("href");

      if (!id || id.length <= 1) {
        return;
      }

      const target = document.querySelector<HTMLElement>(id);
      if (!target) {
        return;
      }

      event.preventDefault();
      const headerOffset = 92;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    };

    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>(anchorSelector));
    anchors.forEach((anchor) => anchor.addEventListener("click", anchorHandler));

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    let observer: IntersectionObserver | undefined;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -44px 0px" },
      );

      revealItems.forEach((item) => observer?.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add("in"));
    }

    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener("click", anchorHandler));
      observer?.disconnect();
    };
  }, []);

  return null;
}
