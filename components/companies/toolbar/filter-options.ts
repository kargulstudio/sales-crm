import {
  ACTIVITY_WINDOWS,
  SEGMENTS,
  SORT_OPTIONS,
  STAGES,
} from "@/data/companies";
import { ANY_STAGE } from "@/lib/companies";

export const STAGE_OPTIONS = [
  { value: ANY_STAGE, label: "Any" },
  ...[...SEGMENTS, ...STAGES].map((tag) => ({ value: tag, label: tag })),
];

export const ACTIVITY_OPTIONS = [
  { value: "0", label: "All time" },
  ...ACTIVITY_WINDOWS.map((days) => ({
    value: String(days),
    label: `${days} Days`,
  })),
];

export const SORT_MENU_OPTIONS = SORT_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
