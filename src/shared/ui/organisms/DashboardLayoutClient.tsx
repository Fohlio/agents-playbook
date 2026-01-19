"use client";

import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="pl-16 pt-4">{children}</main>
    </div>
  );
}
