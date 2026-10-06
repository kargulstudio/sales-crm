"use client";

import { useContactsStore } from "@/stores/contacts-store";
import StatusPill from "@/components/_common/status-pill";

export default function ContactsStatus() {
  const count = useContactsStore(
    (state) =>
      state.contacts.filter((contact) => contact.role === "Decision maker")
        .length,
  );

  return (
    <StatusPill>
      {count} decision {count === 1 ? "maker" : "makers"} in total
    </StatusPill>
  );
}
