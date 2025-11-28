"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/shared/ui/providers/TooltipProvider";
import { ToastProvider } from "@/shared/ui/providers/ToastProvider";

/**
 * Client-side Providers Component
 *
 * Wraps the app with necessary providers for client-side features
 * - NextAuth SessionProvider for authentication state
 * - TooltipProvider for contextual help tooltips
 * - ToastProvider for toast notifications
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </TooltipProvider>
    </SessionProvider>
  );
}
