"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/shared/ui/providers/TooltipProvider";

/**
 * Client-side Providers Component
 *
 * Wraps the app with necessary providers for client-side features
 * - NextAuth SessionProvider for authentication state
 * - TooltipProvider for contextual help tooltips
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </SessionProvider>
  );
}
