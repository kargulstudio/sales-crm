"use client";

import { loggedToday } from "@/lib/activities";
import { useAllActivities } from "@/stores/activities-store";
import StatusPill from "@/components/_common/status-pill";

export default function ActivitiesStatus() {
  const count = loggedToday(useAllActivities());

  return <StatusPill>{count} logged today</StatusPill>;
}
