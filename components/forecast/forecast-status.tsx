"use client";

import { formatDate } from "@/lib/companies";
import { useForecastStore } from "@/stores/forecast-store";
import StatusPill from "@/components/_common/status-pill";

export default function ForecastStatus() {
  const submission = useForecastStore(
    (state) => state.submissions[state.period],
  );

  return (
    <StatusPill tone={submission ? "green" : "amber"}>
      {submission
        ? `Submitted ${formatDate(submission.date)}`
        : "Not submitted"}
    </StatusPill>
  );
}
