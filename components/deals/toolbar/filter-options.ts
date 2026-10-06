import { OWNERS, STAGES } from "@/data/companies";
import { CLOSE_WINDOWS, DEAL_SORT_OPTIONS, REGIONS } from "@/data/deals";
import { ALL_DEAL_OWNERS, ANY_MOTION, ANY_REGION } from "@/lib/deals";

export const DEAL_OWNER_OPTIONS = [
  { value: ALL_DEAL_OWNERS, label: "All Owners" },
  ...OWNERS.map((owner) => ({ value: owner.name, label: owner.name })),
];

export const MOTION_OPTIONS = [
  { value: ANY_MOTION, label: "Any" },
  ...STAGES.map((motion) => ({ value: motion, label: motion })),
];

export const REGION_OPTIONS = [
  { value: ANY_REGION, label: "Any" },
  ...REGIONS.map((region) => ({ value: region, label: region })),
];

export const CLOSE_WINDOW_OPTIONS = CLOSE_WINDOWS.map((window) => ({
  value: window.value,
  label: window.label,
}));

export const DEAL_SORT_MENU_OPTIONS = DEAL_SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
