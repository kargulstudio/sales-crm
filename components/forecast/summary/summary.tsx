"use client";

import { useMemo } from "react";
import SummaryTiles, {
  type SummaryTile,
} from "@/components/_common/summary-tiles";
import { formatMoney } from "@/lib/companies";
import {
  gapToQuota,
  quarterById,
  repRollups,
  teamTotals,
} from "@/lib/forecast";
import { useDealsStore } from "@/stores/deals-store";
import { useForecastStore } from "@/stores/forecast-store";

export default function Summary() {
  const deals = useDealsStore((state) => state.deals);
  const period = useForecastStore((state) => state.period);
  const owner = useForecastStore((state) => state.owner);

  const totals = useMemo(
    () => teamTotals(repRollups(deals, period, owner)),
    [deals, period, owner],
  );
  const gap = gapToQuota(totals);
  const ahead = totals.closed + totals.commit - totals.quota;

  const tiles: SummaryTile[] = [
    {
      key: "quota",
      label: "Quota",
      value: `$${formatMoney(totals.quota)}`,
      note: quarterById(period).label,
    },
    {
      key: "closed",
      label: "Closed Won",
      value: `$${formatMoney(totals.closed)}`,
      percent: totals.attainment,
      percentLabel: `${totals.attainment}%`,
    },
    {
      key: "commit",
      label: "Commit",
      value: `$${formatMoney(totals.commit)}`,
      note: "Likely to close",
    },
    {
      key: "bestCase",
      label: "Best Case",
      value: `$${formatMoney(totals.bestCase)}`,
      note: "Could close",
    },
    {
      key: "pipeline",
      label: "Pipeline",
      value: `$${formatMoney(totals.pipeline)}`,
      note: "Early stage",
    },
    {
      key: "gap",
      label: "Gap to quota",
      value: `$${formatMoney(gap)}`,
      note:
        gap === 0 ? `Ahead by $${formatMoney(ahead)}` : "After closed + commit",
    },
  ];

  return <SummaryTiles tiles={tiles} />;
}
