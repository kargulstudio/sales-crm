import type { Team } from "@/data/team";
import { teamRoster } from "@/lib/team";
import StatusPill from "@/components/_common/status-pill";

type TeamStatusProps = {
  team: Team;
};

export default function TeamStatus({ team }: TeamStatusProps) {
  const count = teamRoster(team).length;

  return (
    <StatusPill>
      {count} {count === 1 ? "rep" : "reps"}
    </StatusPill>
  );
}
