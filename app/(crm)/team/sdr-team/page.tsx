import TeamPage from "@/components/team/team-page";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.sdrTeam);

export default function SdrTeamPage() {
  return <TeamPage team="SDR Team" />;
}
