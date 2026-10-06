import type { ComponentType, SVGProps } from "react";
import Sparkline from "@/components/_common/sparkline";
import type { Company } from "@/data/companies";
import { companyActivity } from "@/lib/companies";
import CursorClickIcon from "@/assets/icons/companies/detail/cursor-click.svg?react";
import MailIcon from "@/assets/icons/companies/detail/mail-03.svg?react";
import CalendarIcon from "@/assets/icons/companies/detail/calendar.svg?react";
import PhoneCallIcon from "@/assets/icons/companies/detail/phone-call.svg?react";

type ActivityTrendProps = {
  company: Company;
  days?: number;
};

type Stat = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
};

export default function ActivityTrend({
  company,
  days = 30,
}: ActivityTrendProps) {
  const activity = companyActivity(company, days);
  const stats: Stat[] = [
    { icon: CursorClickIcon, label: "Total touches", value: activity.touches },
    { icon: MailIcon, label: "Emails", value: activity.emails },
    { icon: CalendarIcon, label: "Meetings", value: activity.meetings },
    { icon: PhoneCallIcon, label: "Calls & notes", value: activity.calls },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-[3px]">
          <span className="block text-[24px] leading-none">
            {activity.total}
          </span>
          <Sparkline values={company.trend} className="h-[22px]" />
        </div>
        <span className="caption-style text-soft block">
          Recorded interactions in the selected period
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-line-strong flex flex-col gap-3 rounded-lg border p-[11px]"
          >
            <span className="caption-style text-soft flex items-center gap-1">
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
