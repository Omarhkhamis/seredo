import { CalendarDays, Clock3, MapPin, MapPinned } from "lucide-react";
import { eventDetails } from "@/data/site";

const icons = [CalendarDays, Clock3, MapPinned, MapPin];

export function EventInfoSection() {
  return (
    <section aria-label="معلومات الحدث" className="border-y border-line bg-white py-9">
      <div className="section-container">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {eventDetails.map((item, index) => {
            const Icon = icons[index] ?? MapPin;
            const content = (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs font-bold text-muted">{item.label}</span>
                  <span className="mt-1 block text-sm font-extrabold text-ink sm:text-base">{item.value}</span>
                </span>
              </>
            );

            if (item.href) {
              return (
                <a
                  key={item.label}
                  className="reveal flex items-start gap-3 rounded-lg p-3 transition hover:bg-mist"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-delay={String(index)}
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={item.label} className="reveal flex items-start gap-3 rounded-lg p-3 transition hover:bg-mist" data-delay={String(index)}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
