import { PIPELINES } from "@/data/pipelines";

export type PageRoute = {
  path: string;
  title: string;
  description: string;
};

export const ROUTES = {
  companies: {
    path: "/",
    title: "Companies",
    description: "Every account in the pipeline with owner, value and health.",
  },
  deals: {
    path: "/deals",
    title: "Deals Board",
    description: "Open deals by stage, ready to move forward.",
  },
  forecast: {
    path: "/forecast",
    title: "Forecast",
    description: "Committed, best case and pipeline against quota.",
  },
  activities: {
    path: "/activities",
    title: "Activities",
    description: "Calls, emails, meetings and tasks across the team.",
  },
  contacts: {
    path: "/contacts",
    title: "Contacts",
    description: "The people behind every account.",
  },
  sequences: {
    path: "/email-sequences",
    title: "Email Sequences",
    description: "Automated outreach and how it performs.",
  },
  strategicAes: {
    path: "/team/strategic-aes",
    title: "Strategic AEs",
    description: "Strategic account executives and their book.",
  },
  midMarket: {
    path: "/team/mid-market",
    title: "Mid Market",
    description: "Mid-market reps and their pipeline.",
  },
  sdrTeam: {
    path: "/team/sdr-team",
    title: "SDR Team",
    description: "Sales development reps and meetings booked.",
  },
  q1Forecast: {
    path: "/reports/q1-forecast",
    title: "Q1 Forecast",
    description: "The Q1 number, rep by rep.",
  },
  slippingDeals: {
    path: "/reports/slipping-deals",
    title: "Slipping Deals",
    description: "Deals that have stalled or pushed their close date.",
  },
  northAmerica: {
    path: "/pipelines/north-america",
    title: "North America",
    description: "The North America pipeline.",
  },
  emeaEnterprise: {
    path: "/pipelines/emea-enterprise",
    title: "EMEA Enterprise",
    description: "The EMEA enterprise pipeline.",
  },
  apacExpansion: {
    path: "/pipelines/apac-expansion",
    title: "APAC Expansion",
    description: "The APAC expansion pipeline.",
  },
} satisfies Record<string, PageRoute>;

export type RouteKey = keyof typeof ROUTES;

export const PIPELINE_TABS = [
  { href: ROUTES.companies.path, label: "Companies" },
  { href: ROUTES.deals.path, label: "Deals" },
  { href: ROUTES.forecast.path, label: "Forecast" },
];

export const PIPELINE_REGION_TABS = PIPELINES.map((pipeline) => ({
  href: ROUTES[pipeline.routeKey].path,
  label: pipeline.title,
}));

export const TEAM_TABS = [
  { href: ROUTES.strategicAes.path, label: "Strategic AEs" },
  { href: ROUTES.midMarket.path, label: "Mid Market" },
  { href: ROUTES.sdrTeam.path, label: "SDR Team" },
];

export const REPORT_TABS = [
  { href: ROUTES.q1Forecast.path, label: "Q1 Forecast" },
  { href: ROUTES.slippingDeals.path, label: "Slipping Deals" },
];

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
