"use client";

import type { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import ConvexSync from "@/components/companies/convex-sync";
import SignIn from "./sign-in";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (!isLoading && !isAuthenticated) return <SignIn />;

  return (
    <>
      {children}
      {isAuthenticated && <ConvexSync />}
    </>
  );
}
