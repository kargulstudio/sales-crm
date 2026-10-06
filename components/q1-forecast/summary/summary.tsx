"use client";

import SummaryTiles, {
  type SummaryTile,
} from "@/components/_common/summary-tiles";
import { formatMoney } from "@/lib/companies";
import { HEALTHY_COVERAGE, formatQ1Coverage } from "@/lib/q1-forecast";
import { useQ1Report } from "@/stores/q1-forecast-store";

export default function Summary() {
  const { totals, openPipeline, weighted, coverage, needed } = useQ1Report();

  const tiles: SummaryTile[] = [
    {
      key: "quota",
      label: "Q1 quota",
      value: `$${formatMoney(totals.quota)}`,
      note: "Jan to Mar 2027",
    },
    {
      key: "closed",
      label: "Closed Won",
      value: `$${formatMoney(totals.closed)}`,
      note: "Already booked",
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
      key: "weighted",
      label: "Weighted",
      value: `$${formatMoney(Math.round(weighted))}`,
      note: "Value times win chance",
    },
    {
      key: "coverage",
      label: "Coverage",
      value: formatQ1Coverage(coverage),
      note: `$${formatMoney(openPipeline)} vs. quota`,
    },
    {
      key: "needed",
      label: `Needed for ${HEALTHY_COVERAGE}x`,
      value: `$${formatMoney(needed)}`,
      note: "More pipeline to add",
    },
  ];

  return <SummaryTiles tiles={tiles} />;
}
