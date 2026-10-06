"use client";

import { useSlippingReport } from "@/stores/slipping-store";
import StatusPill from "@/components/_common/status-pill";

export default function SlippingStatus() {
  const { all } = useSlippingReport();

  return (
    <StatusPill tone={all.length > 0 ? "amber" : "none"}>
      {all.length} slipping
    </StatusPill>
  );
}
