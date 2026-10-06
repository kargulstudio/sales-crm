import type { Company } from "@/data/companies";
import { formatMoney } from "@/lib/companies";
export default function TableFooter({ companies }: { companies: Company[] }) {
  const total = companies.reduce((n, c) => n + c.pipelineValue, 0);
  const stats = [
    [companies.length, "Companies in view"],
    [`$${formatMoney(total)}`, "Sum of pipeline"],
    [
      `${companies.length ? Math.round(companies.reduce((n, c) => n + c.winProbability, 0) / companies.length) : 0}%`,
      "Average win probability",
    ],
    [companies.reduce((n, c) => n + c.openDeals, 0), "Open opportunities"],
  ];
  return (
    <div className="caption-style border-border bg-background grid shrink-0 grid-cols-2 gap-px border-b p-px sm:grid-cols-4">
      {stats.map(([value, label]) => (
        <div
          key={label}
          className="outline-border flex items-center gap-2 p-3 outline-1"
        >
          <span>{value}</span>
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
