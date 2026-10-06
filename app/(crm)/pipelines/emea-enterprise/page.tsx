import PipelinePage from "@/components/pipelines/pipeline-page";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.emeaEnterprise);

export default function EmeaEnterprisePage() {
  return <PipelinePage region="EMEA" />;
}
