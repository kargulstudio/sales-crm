import { OWNERS } from "@/data/companies";
import { SEQUENCE_STATUSES } from "@/data/sequences";
import {
  ALL_SEQUENCE_OWNERS,
  ANY_SEQUENCE_STATUS,
  SEQUENCE_SORT_OPTIONS,
} from "@/lib/sequences";

export const SEQUENCE_SORT_MENU_OPTIONS = SEQUENCE_SORT_OPTIONS.map(
  (option) => ({ value: option.value, label: option.label }),
);

export const SEQUENCE_STATUS_OPTIONS = [
  { value: ANY_SEQUENCE_STATUS, label: "Any" },
  ...SEQUENCE_STATUSES.map((status) => ({ value: status, label: status })),
];

export const SEQUENCE_OWNER_OPTIONS = [
  { value: ALL_SEQUENCE_OWNERS, label: "All Owners" },
  ...OWNERS.map((owner) => ({ value: owner.name, label: owner.name })),
];
