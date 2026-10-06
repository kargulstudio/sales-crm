import { create } from "zustand";
import {
  DEFAULT_FORECAST_FILTERS,
  type ForecastFilters,
  type Submission,
} from "@/lib/forecast";

type ForecastState = ForecastFilters & {
  submissions: Record<string, Submission>;
  submitOpen: boolean;
  setPeriod: (period: string) => void;
  setOwner: (owner: string) => void;
  setCategory: (category: string) => void;
  resetFilters: () => void;
  setSubmitOpen: (open: boolean) => void;
  submitForecast: (period: string, submission: Submission) => void;
};

export const useForecastStore = create<ForecastState>((set) => ({
  ...DEFAULT_FORECAST_FILTERS,
  submissions: {},
  submitOpen: false,
  setPeriod: (period) => set({ period }),
  setOwner: (owner) => set({ owner }),
  setCategory: (category) => set({ category }),
  resetFilters: () => set({ ...DEFAULT_FORECAST_FILTERS }),
  setSubmitOpen: (submitOpen) => set({ submitOpen }),
  submitForecast: (period, submission) =>
    set((state) => ({
      submissions: { ...state.submissions, [period]: submission },
      submitOpen: false,
    })),
}));
