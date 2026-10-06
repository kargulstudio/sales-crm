"use client";

import type { Region } from "@/data/deals";
import { regionOpenCount } from "@/lib/pipelines";
import { useDealsStore } from "@/stores/deals-store";
import StatusPill from "@/components/_common/status-pill";

type PipelineStatusProps = {
  region: Region;
};

export default function PipelineStatus({ region }: PipelineStatusProps) {
  const count = useDealsStore((state) => regionOpenCount(state.deals, region));

  return (
    <StatusPill>
      <span>
        {count} open
        <span className="hidden sm:inline">
          {" "}
          {count === 1 ? "deal" : "deals"}
        </span>
      </span>
    </StatusPill>
  );
}
