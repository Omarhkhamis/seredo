"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  decimals?: number;
};

function formatValue(value: number, decimals: number) {
  if (decimals > 0) {
    return value.toFixed(decimals);
  }

  return Math.round(value).toLocaleString("en-US");
}

export function AnimatedCounter({ value, decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(() => formatValue(0, decimals));

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    let frame = 0;
    const duration = 1_500;

    const animate = () => {
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(formatValue(value * eased, decimals));

        if (progress < 1) {
          frame = requestAnimationFrame(step);
        } else {
          setDisplay(formatValue(value, decimals));
        }
      };

      frame = requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.45 },
      );

      observer.observe(node);

      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
    }

    animate();

    return () => cancelAnimationFrame(frame);
  }, [decimals, value]);

  return <span ref={ref}>{display}</span>;
}
