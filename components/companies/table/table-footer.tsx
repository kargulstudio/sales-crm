"use client";

import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import type { Company } from "@/data/companies";
import { formatMoney } from "@/lib/companies";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/_ui/skeleton";

type TableFooterProps = {
  companies: Company[];
  loading?: boolean;
};

export default function TableFooter({ companies, loading }: TableFooterProps) {
  const pipeline = companies.reduce((sum, c) => sum + c.pipelineValue, 0);
  const openDeals = companies.reduce((sum, c) => sum + c.openDeals, 0);
  const avgWin = companies.length
    ? Math.round(
        companies.reduce((sum, c) => sum + c.winProbability, 0) /
          companies.length,
      )
    : 0;

  const stats = [
    { label: "Companies in view", value: companies.length },
    { label: "Pipeline", value: pipeline, prefix: "$" },
    { label: "Avg win", value: avgWin, suffix: "%" },
    { label: "Open deals", value: openDeals },
  ];

  return (
    <div className="caption-style border-border bg-background short:grid-cols-2 grid shrink-0 grid-cols-2 gap-px overflow-hidden border-y sm:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "outline-border flex items-center gap-2 px-4 py-3 outline-1",
            index > 1 && "short:hidden",
          )}
        >
          {loading ? (
            <Skeleton className="h-3 w-10" />
          ) : (
            <>
              <span className="sr-only">
                {stat.prefix}
                {formatMoney(stat.value)}
                {stat.suffix}
              </span>
              <span
                aria-hidden
                className="text-foreground flex items-center tabular-nums"
              >
                {stat.prefix && (
                  <span className="text-fg-tertiary mr-0.5">{stat.prefix}</span>
                )}
                <SlidingNumber value={stat.value} thousandsSeparator="," />
                {stat.suffix}
              </span>
            </>
          )}
          <span className="text-fg-tertiary truncate">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
