"use client";

import { useSyncExternalStore } from "react";
import { useCompaniesStore } from "@/stores/companies-store";

export function useStoreHydrated() {
  const persisted = useSyncExternalStore(
    (onChange) => useCompaniesStore.persist.onFinishHydration(onChange),
    () => useCompaniesStore.persist.hasHydrated(),
    () => false,
  );
  const loaded = useCompaniesStore((state) => state.loaded);
  return persisted && loaded;
}
