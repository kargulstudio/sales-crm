import Deals from "@/components/deals/deals";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.deals);

export default function DealsPage() {
  return <Deals />;
}
