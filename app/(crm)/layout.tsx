import type { ReactNode } from "react";
import Sidebar from "@/components/_common/sidebar/sidebar";
import CompanyDetail from "@/components/companies/detail/company-detail";
import ContactDetail from "@/components/contacts/detail/contact-detail";
import NewContactDialog from "@/components/contacts/new-contact/new-contact-dialog";
import SequenceDetail from "@/components/sequences/detail/sequence-detail";
import NewSequenceDialog from "@/components/sequences/new-sequence/new-sequence-dialog";
import EnrollDialog from "@/components/sequences/enroll/enroll-dialog";
import ContactEnrollDialog from "@/components/sequences/enroll/contact-enroll-dialog";
import LogActivityDialog from "@/components/activities/log/log-activity-dialog";
import PushDialog from "@/components/slipping-deals/push/push-dialog";
import DealDetail from "@/components/deals/detail/deal-detail";
import NewDealDialog from "@/components/deals/new-deal/new-deal-dialog";
import Profile from "@/components/companies/profile/profile";
import NewCompanyDialog from "@/components/companies/new-company/new-company-dialog";
import CommandMenu from "@/components/companies/command-menu/command-menu";
import InviteDialog from "@/components/_common/dialogs/invite-dialog";
import HelpDialog from "@/components/_common/dialogs/help-dialog";
import BillingDialog from "@/components/_common/dialogs/billing-dialog";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-dvh max-w-full overflow-hidden">
      <Sidebar />
      {children}
      <CompanyDetail />
      <DealDetail />
      <ContactDetail />
      <NewDealDialog />
      <NewContactDialog />
      <SequenceDetail />
      <NewSequenceDialog />
      <EnrollDialog />
      <ContactEnrollDialog />
      <LogActivityDialog />
      <PushDialog />
      <Profile />
      <NewCompanyDialog />
      <CommandMenu />
      <InviteDialog />
      <HelpDialog />
      <BillingDialog />
    </main>
  );
}
