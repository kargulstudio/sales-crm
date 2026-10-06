import { OWNERS } from "@/data/companies";
import { FORECAST_CATEGORIES, QUARTERS } from "@/data/forecast";
import { ALL_FORECAST_OWNERS, ANY_CATEGORY } from "@/lib/forecast";

export const PERIOD_OPTIONS = QUARTERS.map((quarter) => ({
  value: quarter.id,
  label: quarter.label,
}));

export const FORECAST_OWNER_OPTIONS = [
  { value: ALL_FORECAST_OWNERS, label: "All Owners" },
  ...OWNERS.map((owner) => ({ value: owner.name, label: owner.name })),
];

export const CATEGORY_OPTIONS = [
  { value: ANY_CATEGORY, label: "Any" },
  ...FORECAST_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  })),
];
