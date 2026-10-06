"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SummaryTiles, {
  SummaryTileCard,
  type SummaryTile,
} from "@/components/_common/summary-tiles";
import { CURRENT_QUARTER_ID } from "@/data/forecast";
import type { Region } from "@/data/deals";
import { formatMoney } from "@/lib/companies";
import { quarterById } from "@/lib/forecast";
import { pipelineSummary } from "@/lib/pipelines";
import { useDealsStore } from "@/stores/deals-store";

type PipelineSummaryProps = {
  region: Region;
};

export default function PipelineSummary({ region }: PipelineSummaryProps) {
  const deals = useDealsStore((state) => state.deals);
  const summary = useMemo(
    () => pipelineSummary(deals, region),
    [deals, region],
  );
  const quarter = quarterById(CURRENT_QUARTER_ID).label;

  const tiles: SummaryTile[] = [
    {
      key: "open",
      label: "Open pipeline",
      value: `$${formatMoney(summary.openValue)}`,
      note: `${summary.openCount} open ${summary.openCount === 1 ? "deal" : "deals"}`,
    },
    {
      key: "weighted",
      label: "Weighted",
      value: `$${formatMoney(summary.weighted)}`,
      note: "Value times win chance",
    },
    {
      key: "avgWin",
      label: "Avg win",
      value: summary.avgWin === null ? "—" : `${summary.avgWin}%`,
      note: "Bigger deals count more",
    },
    {
      key: "won",
      label: "Won this quarter",
      value: `$${formatMoney(summary.wonValue)}`,
      note: `${summary.wonCount} ${summary.wonCount === 1 ? "deal" : "deals"} in ${quarter}`,
    },
    {
      key: "winRate",
      label: "Win rate",
      value: summary.winRate === null ? "—" : `${summary.winRate}%`,
      note: "All time, won of won and lost",
    },
    {
      key: "stale",
      label: "Stale deals",
      value: String(summary.staleCount),
      note: "No recent activity",
    },
  ];

  return (
    <>
      <ScrollArea fade orientation="horizontal" className="shrink-0 md:hidden">
        <div className="flex w-max gap-2 px-4 pb-4">
          {tiles.map((tile) => (
            <SummaryTileCard
              key={tile.key}
              tile={tile}
              className="w-48 shrink-0"
            />
          ))}
        </div>
      </ScrollArea>
      <SummaryTiles tiles={tiles} className="hidden md:grid" />
    </>
  );
}
