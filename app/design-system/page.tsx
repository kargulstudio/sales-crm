import type { Metadata } from "next";
import type { ReactNode } from "react";
import Button from "@/components/_ui/button";
import { Checkbox } from "@/components/_ui/checkbox";
import CountBadge from "@/components/_ui/count-badge";
import EmptyState from "@/components/_ui/empty-state";
import { Input } from "@/components/_ui/input";
import Kbd from "@/components/_ui/kbd";
import Skeleton from "@/components/_ui/skeleton";
import Tag from "@/components/_ui/tag";
import Tooltip from "@/components/_ui/tooltip";
import SegmentBar from "@/components/_common/segment-bar";
import Sparkline from "@/components/_common/sparkline";
import ThemeMenu from "@/components/companies/header/theme-menu";
import { DEFAULT_TREND, type TagTone } from "@/data/companies";
import PlusIcon from "@/public/assets/images/_common/plus.svg";
import SearchIcon from "@/public/assets/images/_common/search.svg";
import FilterIcon from "@/public/assets/images/_common/filter.svg";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const COLOR_GROUPS = [
  {
    title: "Text & icons",
    tokens: [
      "foreground",
      "fg-secondary",
      "fg-tertiary",
      "fg-disabled",
      "icon",
    ],
  },
  {
    title: "Surfaces",
    tokens: ["background", "card", "popover", "secondary", "muted", "raised"],
  },
  { title: "Lines", tokens: ["border", "line-strong", "input", "ring"] },
  {
    title: "Brand & state",
    tokens: ["primary", "primary-hover", "selected", "status"],
  },
  {
    title: "Feedback",
    tokens: ["success", "warning", "danger", "trend", "trend-muted", "track"],
  },
];

const TYPE_SCALE = [
  { label: "Display · 28", className: "text-display font-semibold" },
  { label: "2XL · 24", className: "text-2xl" },
  { label: "H1 · 18", className: "h1-style" },
  { label: "H2 · 16", className: "h2-style" },
  { label: "H3 · 14", className: "h3-style" },
  { label: "Body · 14", className: "p-style" },
  { label: "Caption · 12", className: "caption-style" },
  { label: "Eyebrow · 12", className: "eyebrow-style" },
];

const SHADOWS = [
  { name: "hairline", className: "bg-card text-fg-secondary shadow-hairline" },
  { name: "raised", className: "bg-card text-fg-secondary shadow-raised" },
  { name: "card", className: "bg-card text-fg-secondary shadow-card" },
  { name: "tile", className: "bg-card text-fg-secondary shadow-tile" },
  {
    name: "brand",
    className: "bg-primary text-primary-foreground shadow-brand",
  },
  { name: "overlay", className: "bg-card text-fg-secondary shadow-overlay" },
];
const RADII = [
  { name: "xs", className: "rounded-xs" },
  { name: "sm", className: "rounded-sm" },
  { name: "md", className: "rounded-md" },
  { name: "lg", className: "rounded-lg" },
  { name: "xl", className: "rounded-xl" },
  { name: "full", className: "rounded-full" },
];
const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "muted",
  "subtle",
  "ghost",
] as const;
const TAG_TONE_LIST: TagTone[] = [
  "blue",
  "purple",
  "green",
  "moss",
  "red",
  "orange",
  "amber",
  "teal",
  "yellow",
  "neutral",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="shadow-divider flex flex-col gap-5 py-8">
      <h2 className="eyebrow-style text-fg-tertiary">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-8">
      <header className="shadow-divider flex items-center justify-between gap-4 py-6">
        <div className="flex flex-col gap-2">
          <h1>Design system</h1>
          <p className="text-fg-tertiary">
            Tokens and components used across Sales CRM.
          </p>
        </div>
        <ThemeMenu />
      </header>

      <Section title="Color">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="text-fg-secondary">{group.title}</h3>
              <ul className="flex flex-col gap-1.5">
                {group.tokens.map((token) => (
                  <li key={token} className="flex items-center gap-2.5">
                    <span
                      className="shadow-hairline size-6 shrink-0 rounded-md"
                      style={{ background: `var(--${token})` }}
                    />
                    <code className="caption-style font-mono">{token}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <ul className="flex flex-col gap-4">
          {TYPE_SCALE.map((item) => (
            <li
              key={item.label}
              className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="caption-style text-fg-tertiary w-28 shrink-0 font-mono">
                {item.label}
              </span>
              <span className={item.className}>
                Pipeline health at a glance
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Elevation & radius">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHADOWS.map((shadow) => (
            <div
              key={shadow.name}
              className={`caption-style flex h-20 items-end rounded-lg p-3 font-mono ${shadow.className}`}
            >
              {shadow.name}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {RADII.map((radius) => (
            <div key={radius.name} className="flex flex-col items-center gap-2">
              <span
                className={`bg-muted shadow-hairline size-12 ${radius.className}`}
              />
              <code className="caption-style text-fg-tertiary font-mono">
                {radius.name}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-col gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <code className="caption-style text-fg-tertiary w-20 font-mono">
                {variant}
              </code>
              <Button variant={variant} size="xs">
                Extra small
              </Button>
              <Button variant={variant} size="sm">
                <PlusIcon aria-hidden className="size-3" />
                Small
              </Button>
              <Button variant={variant} size="md">
                Medium
              </Button>
              <Button variant={variant} size="sm" disabled>
                Disabled
              </Button>
              <Button variant={variant} size="sm" loading>
                Loading
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            <code className="caption-style text-fg-tertiary w-20 font-mono">
              icon
            </code>
            <Tooltip content="Search" shortcut="⌘K">
              <Button variant="secondary" size="icon" aria-label="Search">
                <SearchIcon aria-hidden className="size-3.5" />
              </Button>
            </Tooltip>
            <Button variant="ghost" size="icon-sm" aria-label="Filter">
              <FilterIcon aria-hidden className="size-3" />
            </Button>
            <Button variant="link" size="none">
              Link button
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Tags & badges">
        <div className="flex flex-wrap gap-1.5">
          {TAG_TONE_LIST.map((tone) => (
            <Tag key={tone} tone={tone}>
              {tone}
            </Tag>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tag tone="neutral" size="xs">
            Extra small
          </Tag>
          <CountBadge>24</CountBadge>
          <Kbd>⌘K</Kbd>
          <Kbd>Esc</Kbd>
        </div>
      </Section>

      <Section title="Forms">
        <div className="grid max-w-md gap-4">
          <Input placeholder="Acme Inc." aria-label="Example input" />
          <label className="caption-style text-fg-secondary flex items-center gap-2">
            <Checkbox defaultChecked aria-label="Checked example" />
            Selected row
          </label>
        </div>
      </Section>

      <Section title="Data">
        <div className="flex flex-wrap items-center gap-8">
          <SegmentBar percent={68} className="w-24" />
          <Sparkline values={DEFAULT_TREND} />
        </div>
      </Section>

      <Section title="Feedback">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
          <EmptyState
            icon={FilterIcon}
            title="No companies match these filters"
            description="Remove a filter or widen the activity window."
            className="bg-card rounded-xl"
          />
        </div>
      </Section>
    </main>
  );
}
