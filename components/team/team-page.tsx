import Header from "@/components/_common/header";
import TeamStatus from "./team-status";
import TeamToolbar from "./toolbar/toolbar";
import TeamTable from "./table/team-table";
import type { Team } from "@/data/team";
import { TEAM_TABS } from "@/lib/routes";

type TeamPageProps = {
  team: Team;
};

export default function TeamPage({ team }: TeamPageProps) {
  return (
    <section id="team" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Header
        title={team}
        tabs={TEAM_TABS}
        status={<TeamStatus team={team} />}
      />
      <TeamToolbar team={team} />
      <TeamTable team={team} />
    </section>
  );
}
