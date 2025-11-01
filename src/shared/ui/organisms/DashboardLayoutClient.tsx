"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { useSidebar } from "./DashboardLayout";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <DashboardSidebar />

      {/* Main Content - offset for sidebar */}
      <main
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
