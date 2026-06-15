"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

type CountdownValue = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const targetTime = new Date("2026-09-06T14:00:00+03:00").getTime();

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getCountdown(): CountdownValue {
  const diff = targetTime - Date.now();

  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00" };
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  };
}

export function Countdown() {
  const [value, setValue] = useState<CountdownValue>(() => getCountdown());

  useEffect(() => {
    setValue(getCountdown());
    const interval = window.setInterval(() => setValue(getCountdown()), 1_000);
    return () => window.clearInterval(interval);
  }, []);

  const items = [
    { label: "أيام", value: value.days },
    { label: "ساعات", value: value.hours },
    { label: "دقائق", value: value.minutes },
    { label: "ثواني", value: value.seconds },
  ];

  return (
    <div aria-live="polite" className="rounded-[24px] border border-brand-600/10 bg-white/95 p-4 shadow-soft backdrop-blur sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <span className="font-black text-brand-900 sm:text-base">العد التنازلي لانطلاق سيريدو</span>
        <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
          <MapPin size={15} className="text-brand-600" aria-hidden="true" />
          جدة · المملكة العربية السعودية
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-md bg-brand-900 px-3 py-4 text-center shadow-sm">
            <span suppressHydrationWarning className="block font-display text-3xl font-black leading-none text-white sm:text-4xl">
              {item.value}
            </span>
            <span className="mt-2.5 block text-xs font-medium text-white/70">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
