import { DashboardLayoutClient } from "@/shared/ui/organisms/DashboardLayoutClient";

/**
 * Dashboard Layout
 *
 * Authenticated layout with burger menu navigation
 * Used for all /dashboard/* routes
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
