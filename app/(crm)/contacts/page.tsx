import Contacts from "@/components/contacts/contacts";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata(ROUTES.contacts);

export default function ContactsPage() {
  return <Contacts />;
}
