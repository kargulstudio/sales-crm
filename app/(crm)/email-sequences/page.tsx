import Sequences from "@/components/sequences/sequences";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.sequences);

export default function SequencesPage() {
  return <Sequences />;
}
