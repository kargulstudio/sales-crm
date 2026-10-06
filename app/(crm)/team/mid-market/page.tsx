import TeamPage from "@/components/team/team-page";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.midMarket);

export default function MidMarketPage() {
  return <TeamPage team="Mid Market" />;
}
