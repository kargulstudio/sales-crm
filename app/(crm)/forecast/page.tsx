import Forecast from "@/components/forecast/forecast";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.forecast);

export default function ForecastPage() {
  return <Forecast />;
}
