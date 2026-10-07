import {
  COMPANIES,
  INTERACTION_TYPES,
  OWNERS,
  SEGMENTS,
  STAGES,
  type Company,
  type Owner,
} from "@/data/companies";
import { TODAY } from "@/lib/companies";

export type CrmTagGroup = { label: string; tags: string[] };

export type CrmWorkspace = {
  id: string;
  name: string;
  description: string;
  today: string;
  owners: Owner[];
  tagGroups: CrmTagGroup[];
  interactionTypes: string[];
  companies: Company[];
};

export const CRM_WORKSPACES: CrmWorkspace[] = [
  {
    id: "demo",
    name: "Sales CRM",
    description: "Sample enterprise pipeline that ships with the app.",
    today: TODAY,
    owners: OWNERS,
    tagGroups: [
      { label: "Segment", tags: [...SEGMENTS] },
      { label: "Stage", tags: [...STAGES] },
    ],
    interactionTypes: [...INTERACTION_TYPES],
    companies: COMPANIES,
  },
];

export const DEFAULT_CRM_WORKSPACE_ID = CRM_WORKSPACES[0].id;
