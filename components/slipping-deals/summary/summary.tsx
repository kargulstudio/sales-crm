"use client";

import SummaryTiles, {
  type SummaryTile,
} from "@/components/_common/summary-tiles";
import { CURRENT_QUARTER_ID } from "@/data/forecast";
import { formatMoney } from "@/lib/companies";
import { quarterById } from "@/lib/forecast";
import { useSlippingReport } from "@/stores/slipping-store";

export default function Summary() {
  const { summary } = useSlippingReport();

  const tiles: SummaryTile[] = [
    {
      key: "count",
      label: "Slipping deals",
      value: String(summary.count),
      note: "Pushed or past due",
    },
    {
      key: "value",
      label: "Value at risk",
      value: `$${formatMoney(summary.value)}`,
      note: "Open deal value",
    },
    {
      key: "avgDays",
      label: "Avg days slipped",
      value: `${summary.avgDays}d`,
      note: "Across pushed deals",
    },
    {
      key: "pushed",
      label: "Pushed this quarter",
      value: String(summary.pushedThisQuarter),
      note: `${quarterById(CURRENT_QUARTER_ID).label} pushes`,
    },
    {
      key: "pastDue",
      label: "Past due",
      value: String(summary.pastDueCount),
      note: `$${formatMoney(summary.pastDueValue)} overdue`,
    },
  ];

  return <SummaryTiles tiles={tiles} />;
}
