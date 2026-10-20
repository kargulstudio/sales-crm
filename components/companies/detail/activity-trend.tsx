import type { ComponentType, SVGProps } from "react";
import Sparkline from "@/components/_common/sparkline";
import type { Company } from "@/data/companies";
import {
  companyActivity,
  trendForWindow,
  type TrendWindow,
} from "@/lib/companies";
import CursorClickIcon from "@/public/assets/images/companies/detail/cursor-click.svg";
import MailIcon from "@/public/assets/images/companies/detail/mail-03.svg";
import CalendarIcon from "@/public/assets/images/companies/detail/calendar.svg";
import PhoneCallIcon from "@/public/assets/images/companies/detail/phone-call.svg";

type ActivityTrendProps = {
  company: Company;
  window: TrendWindow;
};

type Stat = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
};

export default function ActivityTrend({ company, window }: ActivityTrendProps) {
  const activity = companyActivity(company, window);
  const stats: Stat[] = [
    { icon: CursorClickIcon, label: "Total touches", value: activity.touches },
    { icon: MailIcon, label: "Emails", value: activity.emails },
    { icon: CalendarIcon, label: "Meetings", value: activity.meetings },
    { icon: PhoneCallIcon, label: "Calls & notes", value: activity.calls },
  ];

  return (
    <div className="flex flex-col gap-3 tabular-nums">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-0.75">
          <span className="block text-2xl leading-none font-semibold">
            {activity.total}
          </span>
          <Sparkline
            values={trendForWindow(company.trend, window)}
            className="h-5.5"
          />
        </div>
        <span className="caption-style text-fg-secondary block">
          Spikes around QBR prep and renewal review
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-line-strong flex flex-col gap-3 rounded-lg border p-2.75"
          >
            <span className="caption-style text-fg-secondary flex items-center gap-1">
              <stat.icon aria-hidden className="size-3 shrink-0" />
              {stat.label}
            </span>
            <span className="lead-style block">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
