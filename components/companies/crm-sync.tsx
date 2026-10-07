"use client";

import { useEffect } from "react";
import { loadCrmCompanies, loadCrmRevision } from "@/lib/crm/actions";
import { useCompaniesStore } from "@/stores/companies-store";

export const CRM_CHANGED_EVENT = "crm:changed";

const POLL_MS = 3000;

export function notifyCrmChanged() {
  window.dispatchEvent(new Event(CRM_CHANGED_EVENT));
}

export default function CrmSync() {
  const setCompanies = useCompaniesStore((state) => state.setCompanies);

  useEffect(() => {
    let revision = -1;
    let busy = false;

    async function sync() {
      if (busy || document.hidden) return;
      busy = true;
      try {
        if ((await loadCrmRevision()) !== revision) {
          const next = await loadCrmCompanies();
          revision = next.revision;
          setCompanies(next.companies);
        }
      } catch {
      } finally {
        busy = false;
      }
    }

    sync();
    const timer = window.setInterval(sync, POLL_MS);
    window.addEventListener("focus", sync);
    window.addEventListener(CRM_CHANGED_EVENT, sync);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", sync);
      window.removeEventListener(CRM_CHANGED_EVENT, sync);
    };
  }, [setCompanies]);

  return null;
}
