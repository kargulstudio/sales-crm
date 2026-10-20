"use client";

import { useSyncExternalStore } from "react";
import { LIGHT_QUERY, STORAGE_KEY } from "./theme-script";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" || value === "system"
      ? value
      : "system";
  } catch {
    return "system";
  }
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference !== "system") return preference;
  return matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function apply(theme: ResolvedTheme) {
  const root = document.documentElement;
  if (root.dataset.theme === theme) return;
  root.dataset.themeSwitching = "";
  root.dataset.theme = theme;
  root.getClientRects();
  requestAnimationFrame(() => delete root.dataset.themeSwitching);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const media = matchMedia(LIGHT_QUERY);
  const onSystemChange = () => {
    if (readPreference() === "system") apply(resolve("system"));
  };
  media.addEventListener("change", onSystemChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) apply(resolve(readPreference()));
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setThemePreference(preference: ThemePreference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {}
  apply(resolve(preference));
  listeners.forEach((listener) => listener());
}

export function useThemePreference() {
  return useSyncExternalStore(
    subscribe,
    readPreference,
    () => "system" as const,
  );
}
