"use client";

import { signOut, useSession } from "next-auth/react";
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
                href={ROUTES.DASHBOARD}
                variant="secondary"
                testId="dashboard-nav-link"
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.DISCOVER}
                variant="secondary"
                testId="discover-nav-link"
              >
                Discover
              </Link>
              <Link
                href={ROUTES.WORKFLOWS.LIST}
                variant="secondary"
                testId="workflows-nav-link"
              >
                Workflows
              </Link>
              <Link
                href={ROUTES.MINI_PROMPTS.LIST}
                variant="secondary"
                testId="mini-prompts-nav-link"
              >
                Mini-Prompts
              </Link>
              <Link
                href={ROUTES.SETTINGS}
                variant="secondary"
                testId="settings-nav-link"
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

