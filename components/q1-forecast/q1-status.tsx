"use client";

import { HEALTHY_COVERAGE, formatQ1Coverage } from "@/lib/q1-forecast";
import { useQ1Report } from "@/stores/q1-forecast-store";
import StatusPill from "@/components/_common/status-pill";

export default function Q1Status() {
  const { coverage, openPipeline } = useQ1Report();
  const needsPipeline = openPipeline === 0 || (coverage ?? 0) < 1;
  const healthy = (coverage ?? 0) >= HEALTHY_COVERAGE;
  const label =
    openPipeline === 0
      ? "Needs pipeline"
      : coverage === null
        ? "No quota"
        : `Coverage ${formatQ1Coverage(coverage)}`;

  return (
    <StatusPill tone={needsPipeline ? "amber" : healthy ? "green" : "none"}>
      {label}
    </StatusPill>
  );
}
