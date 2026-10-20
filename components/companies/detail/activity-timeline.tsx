"use client";

import type { ComponentType, SVGProps } from "react";
import Avatar from "@/components/_ui/avatar";
import { profileByName } from "@/data/companies";
import {
  formatTimestamp,
  type TimelineEntry,
  type TimelineKind,
} from "@/lib/activity";
import MailIcon from "@/public/assets/images/companies/detail/mail-03.svg";
import CalendarIcon from "@/public/assets/images/companies/detail/calendar.svg";
import PhoneCallIcon from "@/public/assets/images/companies/detail/phone-call.svg";
import EditIcon from "@/public/assets/images/companies/detail/edit.svg";
import NoteIcon from "@/public/assets/images/companies/detail/note.svg";

const ICONS: Record<TimelineKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  email: MailIcon,
  meeting: CalendarIcon,
  call: PhoneCallIcon,
  change: EditIcon,
  note: NoteIcon,
};

type ActivityTimelineProps = {
  entries: TimelineEntry[];
};

export default function ActivityTimeline({ entries }: ActivityTimelineProps) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const Icon = ICONS[entry.kind];
        const author = profileByName(entry.author);
        const last = index === entries.length - 1;
        return (
          <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className="bg-border absolute top-7 bottom-1 left-3 w-px"
              />
            )}
            <span className="bg-raised shadow-hairline text-fg-secondary flex size-6 shrink-0 items-center justify-center rounded-full">
              <Icon aria-hidden className="size-3" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="lead-style text-foreground font-medium">
                  {entry.title}
                </span>
                <time
                  dateTime={entry.at}
                  className="caption-style text-fg-tertiary tabular-nums"
                >
                  {formatTimestamp(entry.at)}
                </time>
              </div>
              {entry.detail && (
                <p className="text-fg-secondary text-sm leading-snug break-words whitespace-pre-wrap">
                  {entry.detail}
                </p>
              )}
              <span className="caption-style text-fg-tertiary flex items-center gap-1.5">
                <Avatar
                  src={author.avatar}
                  name={author.name}
                  alt=""
                  className="size-4"
                />
                {author.name}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
