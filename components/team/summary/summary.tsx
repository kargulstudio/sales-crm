"use client";

import SummaryTiles, {
  type SummaryTile,
} from "@/components/_common/summary-tiles";
import type { Team } from "@/data/team";
import { formatMoney } from "@/lib/companies";
import { quarterById } from "@/lib/forecast";
import {
  formatAttainment,
  formatTeamCoverage,
  isSdrTeam,
  teamSummary,
  type TeamMember,
} from "@/lib/team";
import { useTeamStore } from "@/stores/team-store";

type SummaryProps = {
  team: Team;
  members: TeamMember[];
};

export default function Summary({ team, members }: SummaryProps) {
  const period = useTeamStore((state) => state.period);
  const summary = teamSummary(members);
  const quarter = quarterById(period).label;
  const sdr = isSdrTeam(team);

  const tiles: SummaryTile[] = sdr
    ? [
        {
          key: "meetings",
          label: "Meetings booked",
          value: String(summary.meetings),
          note: quarter,
        },
        {
          key: "target",
          label: "Target",
          value: String(summary.target),
          note: `${members.length} reps`,
        },
        {
          key: "attainment",
          label: "Attainment",
          value: formatAttainment(summary.meetingAttainment),
          percent: summary.meetingAttainment,
        },
        {
          key: "pipeline",
          label: "All open pipeline",
          value: `$${formatMoney(summary.openPipeline)}`,
          note: `All quarters, ${summary.openDeals} deals`,
        },
      ]
    : [
        {
          key: "quota",
          label: "Team quota",
          value: `$${formatMoney(summary.rollup.quota)}`,
          note: quarter,
        },
        {
          key: "closed",
          label: "Closed Won",
          value: `$${formatMoney(summary.rollup.closed)}`,
          note: "Won this quarter",
        },
        {
          key: "attainment",
          label: "Attainment",
          value: formatAttainment(summary.attainment),
          percent: summary.attainment ?? 0,
        },
        {
          key: "pipeline",
          label: "All open pipeline",
          value: `$${formatMoney(summary.openPipeline)}`,
          note: `All quarters, ${summary.openDeals} deals`,
        },
        {
          key: "coverage",
          label: "Coverage",
          value: formatTeamCoverage(summary),
          note: `${quarter} pipeline vs. remaining`,
        },
      ];

  return <SummaryTiles tiles={tiles} className="sticky left-0" />;
}
