"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/shared/ui/atoms";

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
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900" data-testid="dashboard-logo">
                Agents Playbook
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  data-testid="dashboard-nav-link"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  data-testid="settings-nav-link"
                >
                  Settings
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {session?.user && (
                <>
                  <div className="hidden md:block text-sm text-gray-700" data-testid="user-info">
                    <span className="font-medium" data-testid="user-display-name">{session.user.username || session.user.email}</span>
                    {session.user.tier && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800" data-testid="user-tier-badge">
                        {session.user.tier}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    testId="signout-button"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
