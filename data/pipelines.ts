import type { Region } from "@/data/deals";
import type { RouteKey } from "@/lib/routes";

export type Pipeline = {
  id: string;
  routeKey: Extract<
    RouteKey,
    "northAmerica" | "emeaEnterprise" | "apacExpansion"
  >;
  title: string;
  region: Region;
};

export const PIPELINES: Pipeline[] = [
  {
    id: "north-america",
    routeKey: "northAmerica",
    title: "North America",
    region: "North America",
  },
  {
    id: "emea-enterprise",
    routeKey: "emeaEnterprise",
    title: "EMEA Enterprise",
    region: "EMEA",
  },
  {
    id: "apac-expansion",
    routeKey: "apacExpansion",
    title: "APAC Expansion",
    region: "APAC",
  },
];

export function pipelineByRegion(region: Region) {
  return PIPELINES.find((pipeline) => pipeline.region === region) as Pipeline;
}
