"use client";

import StackedBar from "./stacked-bar";
import { formatMoney } from "@/lib/companies";
import { Q1_CATEGORIES } from "@/lib/q1-forecast";
import { useQ1Report } from "@/stores/q1-forecast-store";
import type { ForecastCategory } from "@/data/forecast";

const CATEGORY_BAR: Record<string, string> = {
  Closed: "bg-(--tag-purple-text)",
  Commit: "bg-success",
  "Best Case": "bg-warning",
  Pipeline: "bg-(--tag-blue-text)",
};

export default function Months() {
  const { months } = useQ1Report();

  return (
    <section className="border-border flex shrink-0 flex-col border-t">
      <div className="flex h-[38px] items-center px-3">
        <span className="eyebrow-style text-subtle">By month</span>
      </div>
      <div className="border-border grid grid-cols-1 gap-2 border-t p-4 sm:grid-cols-3">
        {months.map((month) => (
          <div
            key={month.key}
            className="border-line-strong flex min-w-0 flex-col gap-3 rounded-lg border p-[11px]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="caption-style text-soft block">
                {month.label} 2027
              </span>
              <span className="caption-style text-soft block tabular-nums">
                {month.count} {month.count === 1 ? "deal" : "deals"}
              </span>
            </div>
            <span className="lead-style block truncate tabular-nums">
              ${formatMoney(month.total)}
            </span>
            <StackedBar
              label={`${month.label} by category`}
              parts={Q1_CATEGORIES.map((category: ForecastCategory) => ({
                key: category,
                value: month.byCategory[category],
                className: CATEGORY_BAR[category],
              }))}
            />
            <ul className="divide-border caption-style flex flex-col divide-y">
              {Q1_CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="flex items-center justify-between gap-2 py-1.5"
                >
                  <span className="text-soft flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className={`size-2 rounded-[2px] ${CATEGORY_BAR[category]}`}
                    />
                    {category}
                  </span>
                  <span className="tabular-nums">
                    ${formatMoney(month.byCategory[category])}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
