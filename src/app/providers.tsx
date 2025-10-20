"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side Providers Component
 *
 * Wraps the app with necessary providers for client-side features
 * - NextAuth SessionProvider for authentication state
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
