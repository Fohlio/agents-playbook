import { DashboardHeader } from "@/shared/ui/organisms/DashboardHeader";

/**
 * Dashboard Layout
 *
 * Authenticated layout with header navigation and sign out button
 * Used for all /dashboard/* routes
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
