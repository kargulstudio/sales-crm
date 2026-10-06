"use client";

import { useActiveSequenceCount } from "@/stores/sequences-store";
import StatusPill from "@/components/_common/status-pill";

export default function SequencesStatus() {
  const count = useActiveSequenceCount();

  return <StatusPill>{count} active</StatusPill>;
}
