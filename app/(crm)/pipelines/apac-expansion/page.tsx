import PipelinePage from "@/components/pipelines/pipeline-page";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.apacExpansion);

export default function ApacExpansionPage() {
  return <PipelinePage region="APAC" />;
}
