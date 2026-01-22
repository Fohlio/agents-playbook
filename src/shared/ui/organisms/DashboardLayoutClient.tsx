"use client";

import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050508] relative">
      {/* Circuit grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Scan lines overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
      }}></div>
      
      <DashboardSidebar />
      <main className="relative pl-16 pt-4 pr-4 pb-8 min-h-screen">{children}</main>
    </div>
  );
}
