import PipelinePage from "@/components/pipelines/pipeline-page";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.northAmerica);

export default function NorthAmericaPage() {
  return <PipelinePage region="North America" />;
}
