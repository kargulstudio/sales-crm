import SlippingDeals from "@/components/slipping-deals/slipping-deals";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.slippingDeals);

export default function SlippingDealsPage() {
  return <SlippingDeals />;
}
