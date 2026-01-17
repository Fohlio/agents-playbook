import { DashboardLayoutClient } from "@/shared/ui/organisms/DashboardLayoutClient";
import { SidebarProvider } from "@/shared/ui/organisms/DashboardLayout";

/**
 * Dashboard Layout
 *
 * Authenticated layout with sidebar navigation and sign out button
 * Used for all /dashboard/* routes
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </SidebarProvider>
  );
}
