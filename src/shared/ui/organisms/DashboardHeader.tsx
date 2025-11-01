"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button, Link, Badge } from "@/shared/ui/atoms";
import { ROUTES } from "@/shared/routes";

/**
 * Dashboard Header
 *
 * Authenticated header with navigation and user menu
 * Uses design system components from atoms
 */
export function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link 
              href={ROUTES.DASHBOARD} 
              variant="secondary"
              className="text-xl font-bold"
              testId="dashboard-logo"
            >
              Agents Playbook
            </Link>
            
            <nav className="hidden md:flex gap-6">
              <Link
                href={ROUTES.GETTING_STARTED}
                variant="secondary"
                testId="getting-started-nav-link"
                className={pathname === ROUTES.GETTING_STARTED ? 'text-blue-600 font-semibold' : ''}
              >
                Getting Started
              </Link>
              <Link
                href={ROUTES.DASHBOARD}
                variant="secondary"
                testId="dashboard-nav-link"
                className={pathname === ROUTES.DASHBOARD ? 'text-blue-600 font-semibold' : ''}
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.DISCOVER}
                variant="secondary"
                testId="discover-nav-link"
                className={pathname === ROUTES.DISCOVER ? 'text-blue-600 font-semibold' : ''}
              >
                Discover
              </Link>
              <Link
                href="/dashboard/library"
                variant="secondary"
                testId="library-nav-link"
                className={pathname === '/dashboard/library' ? 'text-blue-600 font-semibold' : ''}
              >
                Library
              </Link>
              {isAdmin && (
                <Link
                  href={ROUTES.ADMIN.SYSTEM_WORKFLOWS}
                  variant="secondary"
                  testId="admin-nav-link"
                  className={`flex items-center gap-1 ${pathname?.startsWith('/dashboard/admin') ? 'text-blue-600 font-semibold' : ''}`}
                >
                  Admin
                  <Badge variant="primary" testId="admin-badge">
                    System
                  </Badge>
                </Link>
              )}
              <Link
                href={ROUTES.SETTINGS}
                variant="secondary"
                testId="settings-nav-link"
                className={pathname === ROUTES.SETTINGS ? 'text-blue-600 font-semibold' : ''}
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          {session?.user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2" data-testid="user-info">
                <span className="text-sm font-medium text-gray-700" data-testid="user-display-name">
                  {session.user.username || session.user.email}
                </span>
                {session.user.tier && (
                  <Badge variant="primary" testId="user-tier-badge">
                    {session.user.tier}
                  </Badge>
                )}
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
                testId="signout-button"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

