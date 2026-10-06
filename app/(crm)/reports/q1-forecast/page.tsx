import Q1Forecast from "@/components/q1-forecast/q1-forecast";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.q1Forecast);

export default function Q1ForecastPage() {
  return <Q1Forecast />;
}
