import TeamPage from "@/components/team/team-page";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.strategicAes);

export default function StrategicAesPage() {
  return <TeamPage team="Strategic AEs" />;
}
