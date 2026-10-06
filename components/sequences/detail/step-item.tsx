import type { SequenceChannel, SequenceStep } from "@/data/sequences";
import { CHANNEL_NOUNS } from "@/lib/sequences";
import MailIcon from "@/public/assets/images/companies/sidebar/mail.svg";
import PhoneIcon from "@/public/assets/images/companies/detail/phone.svg";
import UsersIcon from "@/public/assets/images/companies/sidebar/users.svg";

const CHANNEL_ICONS: Record<SequenceChannel, typeof MailIcon> = {
  Email: MailIcon,
  "Call task": PhoneIcon,
  "LinkedIn task": UsersIcon,
};

type StepItemProps = {
  step: SequenceStep;
};

export default function StepItem({ step }: StepItemProps) {
  const Icon = CHANNEL_ICONS[step.channel];
  const nouns = CHANNEL_NOUNS[step.channel];
  const stats = [
    { label: nouns.sent, value: step.sent },
    { label: nouns.opened, value: step.opened },
    { label: nouns.replied, value: step.replied },
  ];

  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-full outline-1 -outline-offset-1 outline-white/10">
          <Icon aria-hidden className="text-soft size-3.5" />
        </span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="caption-style text-soft">
            Day {step.day} · {step.channel}
          </span>
          <span className="text-foreground">{step.subject}</span>
          {step.preview && (
            <span className="caption-style text-subtle">{step.preview}</span>
          )}
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-line-strong flex flex-col gap-1.5 rounded-lg border p-2.5"
          >
            <dt className="caption-style text-subtle">{stat.label}</dt>
            <dd className="text-foreground tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}
