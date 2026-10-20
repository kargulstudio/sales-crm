"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ACTIVITY_WINDOWS,
  OWNERS,
  SORT_OPTIONS,
  type SortKey,
} from "@/data/companies";
import {
  DEFAULT_FILTERS,
  VIEWS,
  defaultSortDir,
  type CompanyFilters,
  type View,
} from "@/lib/companies";
import { STAGE_OPTIONS } from "./toolbar/filter-options";
import { useCompaniesStore } from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";

const FILTER_PARAMS = [
  "view",
  "sort",
  "dir",
  "owner",
  "stage",
  "activity",
] as const;

function parseFilters(params: URLSearchParams): CompanyFilters {
  const sort = params.get("sort");
  const owner = params.get("owner");
  const stage = params.get("stage");
  const activity = Number(params.get("activity"));
  const dir = params.get("dir");
  const view = params.get("view");
  const sortBy = SORT_OPTIONS.some((option) => option.value === sort)
    ? (sort as SortKey)
    : DEFAULT_FILTERS.sortBy;

  return {
    sortBy,
    sortDir: dir === "asc" || dir === "desc" ? dir : defaultSortDir(sortBy),
    view: VIEWS.some((item) => item.value === view)
      ? (view as View)
      : DEFAULT_FILTERS.view,
    owner: OWNERS.some((item) => item.name === owner)
      ? owner!
      : DEFAULT_FILTERS.owner,
    stage: STAGE_OPTIONS.some((option) => option.value === stage)
      ? stage!
      : DEFAULT_FILTERS.stage,
    activityWindow: (ACTIVITY_WINDOWS as readonly number[]).includes(activity)
      ? activity
      : DEFAULT_FILTERS.activityWindow,
  };
}

function filtersQuery(filters: CompanyFilters, base: URLSearchParams) {
  const params = new URLSearchParams(base);
  FILTER_PARAMS.forEach((key) => params.delete(key));
  if (filters.view !== DEFAULT_FILTERS.view) {
    params.set("view", filters.view);
  }
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.set("sort", filters.sortBy);
  }
  if (filters.sortDir !== defaultSortDir(filters.sortBy)) {
    params.set("dir", filters.sortDir);
  }
  if (filters.owner !== DEFAULT_FILTERS.owner) {
    params.set("owner", filters.owner);
  }
  if (filters.stage !== DEFAULT_FILTERS.stage) {
    params.set("stage", filters.stage);
  }
  if (filters.activityWindow !== DEFAULT_FILTERS.activityWindow) {
    params.set("activity", String(filters.activityWindow));
  }
  return params.toString();
}

function sameFilters(a: CompanyFilters, b: CompanyFilters) {
  return (
    a.sortBy === b.sortBy &&
    a.sortDir === b.sortDir &&
    a.view === b.view &&
    a.owner === b.owner &&
    a.stage === b.stage &&
    a.activityWindow === b.activityWindow
  );
}

const COMPANY_PATH = /^\/companies\/([^/]+)\/?$/;

function companyIdFromPath(pathname: string) {
  const match = COMPANY_PATH.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

function desiredPath(state: { detailOpen: boolean; detailId: string | null }) {
  return state.detailOpen && state.detailId
    ? `/companies/${encodeURIComponent(state.detailId)}`
    : "/";
}

export default function CompaniesSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const query = searchParams.toString();
  const loaded = useCompaniesStore((state) => state.loaded);
  const initialized = useRef(false);
  const missingNotified = useRef<string | null>(null);

  useEffect(() => {
    useCompaniesStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(query);
    const hasFilterParams = FILTER_PARAMS.some((key) => params.has(key));
    const firstRun = !initialized.current;
    initialized.current = true;

    // A bare URL on first load restores the saved filters instead of resetting them.
    if (firstRun && !hasFilterParams) {
      const next = filtersQuery(useCompaniesStore.getState(), params);
      if (next !== query) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${next ? `?${next}` : ""}`,
        );
      }
      return;
    }

    const fromUrl = parseFilters(params);
    if (!sameFilters(useCompaniesStore.getState(), fromUrl)) {
      useCompaniesStore.setState(fromUrl);
    }
  }, [query]);

  useEffect(() => {
    const id = companyIdFromPath(pathname);
    const state = useCompaniesStore.getState();
    if (!id) {
      if (state.detailOpen) state.closeDetail();
      return;
    }
    if (!loaded || state.companies.some((company) => company.id === id)) {
      if (!state.detailOpen || state.detailId !== id) state.openDetail(id);
      return;
    }
    window.history.replaceState(null, "", `/${window.location.search}`);
    state.closeDetail();
    if (missingNotified.current !== id) toast("That company no longer exists");
    missingNotified.current = id;
  }, [pathname, loaded]);

  useEffect(
    () =>
      useCompaniesStore.subscribe((state) => {
        const current = new URLSearchParams(window.location.search);
        const path = desiredPath(state);
        const pathChanged = path !== window.location.pathname;
        const filtersChanged = !sameFilters(state, parseFilters(current));
        if (!pathChanged && !filtersChanged) return;
        const next = filtersChanged
          ? filtersQuery(state, current)
          : current.toString();
        window.history.pushState(null, "", `${path}${next ? `?${next}` : ""}`);
      }),
    [],
  );

  return null;
}
