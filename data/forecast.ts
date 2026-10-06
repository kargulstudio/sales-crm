export const FORECAST_CATEGORIES = [
  "Commit",
  "Best Case",
  "Pipeline",
  "Closed",
  "Omitted",
] as const;

export type ForecastCategory = (typeof FORECAST_CATEGORIES)[number];

export const OPEN_CATEGORIES: ForecastCategory[] = [
  "Commit",
  "Best Case",
  "Pipeline",
  "Omitted",
];

export type Quarter = {
  id: string;
  label: string;
  start: string;
  end: string;
};

export const QUARTERS: Quarter[] = [
  { id: "2026-q3", label: "Q3 2026", start: "2026-07-01", end: "2026-09-30" },
  { id: "2026-q4", label: "Q4 2026", start: "2026-10-01", end: "2026-12-31" },
  { id: "2027-q1", label: "Q1 2027", start: "2027-01-01", end: "2027-03-31" },
];

export const Q1_QUARTER_ID = "2027-q1";

export const CURRENT_QUARTER_ID = "2026-q3";

export const QUOTAS: Record<string, Record<string, number>> = {
  "2026-q3": {
    "Mark Darnalds": 350000,
    "Maria Keller": 200000,
    "Noah Lee": 275000,
    "Ricky Brown": 225000,
    "Sarah Nguyen": 550000,
    "James Taylor": 275000,
    "Alex Santos": 200000,
    "Ava Brooks": 225000,
    "Emma Green": 100000,
    "Kate Chen": 175000,
    "Nia Jameson": 200000,
    "Oliver Chan": 100000,
    "Drew Nash": 75000,
    "Jamie Fox": 50000,
    "Chloe Park": 50000,
    "Grace Miller": 100000,
    "Lina Wong": 50000,
  },
  "2026-q4": {
    "Mark Darnalds": 450000,
    "James Taylor": 400000,
    "Kate Chen": 350000,
    "Nia Jameson": 350000,
    "Maria Keller": 300000,
    "Ava Brooks": 300000,
    "Noah Lee": 250000,
    "Drew Nash": 200000,
    "Grace Miller": 200000,
    "Hannah Mills": 175000,
    "Emma Green": 150000,
    "Sarah Nguyen": 600000,
    "Ricky Brown": 250000,
    "Alex Santos": 250000,
  },
  "2027-q1": {
    "Sarah Nguyen": 500000,
    "Mark Darnalds": 450000,
    "James Taylor": 400000,
    "Noah Lee": 300000,
    "Ricky Brown": 250000,
    "Ava Brooks": 300000,
    "Maria Keller": 250000,
    "Alex Santos": 225000,
    "Nia Jameson": 300000,
    "Kate Chen": 300000,
    "Emma Green": 150000,
    "Grace Miller": 200000,
    "Drew Nash": 175000,
    "Hannah Mills": 175000,
  },
};
