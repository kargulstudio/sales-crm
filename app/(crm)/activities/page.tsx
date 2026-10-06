import Activities from "@/components/activities/activities";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.activities);

export default function ActivitiesPage() {
  return <Activities />;
}
