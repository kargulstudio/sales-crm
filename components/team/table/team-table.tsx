"use client";

import { ScrollArea } from "@/components/_ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import Summary from "../summary/summary";
import MemberRow from "./member-row";
import TableFooter from "./table-footer";
import {
  AE_COLUMNS,
  AE_GRID_CLASS,
  SDR_COLUMNS,
  SDR_GRID_CLASS,
  TEAM_CELL_CLASS,
  TEAM_ROW_CLASS,
} from "./table-columns";
import type { Team } from "@/data/team";
import { isSdrTeam, teamSummary } from "@/lib/team";
import { cn } from "@/lib/utils";
import { useCompaniesStore } from "@/stores/companies-store";
import { useTeamMembers } from "@/stores/team-store";

type TeamTableProps = {
  team: Team;
};

export default function TeamTable({ team }: TeamTableProps) {
  const members = useTeamMembers(team);
  const openProfile = useCompaniesStore((state) => state.openProfile);
  const sdr = isSdrTeam(team);
  const columns = sdr ? SDR_COLUMNS : AE_COLUMNS;

  return (
    <div className="border-border flex min-h-0 flex-1 flex-col border-t">
      <ScrollArea orientation="both" className="min-h-0 flex-1">
        <Summary team={team} members={members} />
        <Table
          role="table"
          className={cn(sdr ? SDR_GRID_CLASS : AE_GRID_CLASS, "w-full")}
        >
          <TableHeader role="rowgroup" className="contents">
            <TableRow
              role="row"
              className={cn(TEAM_ROW_CLASS, "bg-background sticky top-0 z-10")}
            >
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  role="columnheader"
                  className={cn(TEAM_CELL_CLASS, column.className)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody role="rowgroup" className="contents">
            {members.map((member) => (
              <MemberRow
                key={member.owner.name}
                member={member}
                columns={columns}
                onOpen={() => openProfile(member.owner.name)}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <TableFooter
        key={team}
        count={members.length}
        summary={teamSummary(members)}
        sdr={sdr}
      />
    </div>
  );
}
