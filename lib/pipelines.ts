import { LOST_STAGE, WON_STAGE, type Deal, type Region } from "@/data/deals";
import { CURRENT_QUARTER_ID } from "@/data/forecast";
import { dealsInQuarter } from "@/lib/forecast";
import { dealWin, isOpenStage, isStale, openDeals } from "@/lib/deals";

export type PipelineSummary = {
  openCount: number;
  openValue: number;
  weighted: number;
  avgWin: number | null;
  wonValue: number;
  wonCount: number;
  winRate: number | null;
  staleCount: number;
};

function regionDeals(deals: Deal[], region: Region) {
  return deals.filter((deal) => deal.region === region);
}

export function regionOpenCount(deals: Deal[], region: Region) {
  return regionDeals(deals, region).filter((deal) => isOpenStage(deal.stage))
    .length;
}

export function pipelineSummary(
  deals: Deal[],
  region: Region,
): PipelineSummary {
  const inRegion = regionDeals(deals, region);
  const open = openDeals(inRegion);
  const openValue = open.reduce((sum, deal) => sum + deal.value, 0);
  const weighted = open.reduce(
    (sum, deal) => sum + (deal.value * dealWin(deal)) / 100,
    0,
  );
  const wonThisQuarter = dealsInQuarter(inRegion, CURRENT_QUARTER_ID).filter(
    (deal) => deal.stage === WON_STAGE,
  );
  const won = inRegion.filter((deal) => deal.stage === WON_STAGE).length;
  const lost = inRegion.filter((deal) => deal.stage === LOST_STAGE).length;

  return {
    openCount: open.length,
    openValue,
    weighted: Math.round(weighted),
    avgWin: openValue > 0 ? Math.round((weighted / openValue) * 100) : null,
    wonValue: wonThisQuarter.reduce((sum, deal) => sum + deal.value, 0),
    wonCount: wonThisQuarter.length,
    winRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null,
    staleCount: open.filter(isStale).length,
  };
}
