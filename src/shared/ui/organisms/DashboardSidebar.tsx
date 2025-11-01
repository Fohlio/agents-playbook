"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, Link, Badge } from "@/shared/ui/atoms";
import { Tooltip } from "@/shared/ui/molecules";
import { ROUTES } from "@/shared/routes";
import { useSidebar } from "./DashboardLayout";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExploreIcon from '@mui/icons-material/Explore';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';

/**
 * Dashboard Sidebar
 *
 * Collapsible sidebar navigation for dashboard
 * Mobile-friendly with hamburger menu
 */
export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'ADMIN';
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const closeSidebar = () => setIsOpen(false);

  const navItems = [
    { href: ROUTES.GETTING_STARTED, label: 'Getting Started', icon: RocketLaunchIcon, testId: 'getting-started-nav-link' },
    { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: DashboardIcon, testId: 'dashboard-nav-link' },
    { href: ROUTES.DISCOVER, label: 'Discover', icon: ExploreIcon, testId: 'discover-nav-link' },
    { href: '/dashboard/library', label: 'Library', icon: LibraryBooksIcon, testId: 'library-nav-link' },
    ...(isAdmin ? [{ href: ROUTES.ADMIN.SYSTEM_WORKFLOWS, label: 'Admin', icon: AdminPanelSettingsIcon, testId: 'admin-nav-link', badge: 'System' }] : []),
    { href: ROUTES.SETTINGS, label: 'Settings', icon: SettingsIcon, testId: 'settings-nav-link' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
        aria-label="Toggle menu"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <Link
                href={ROUTES.DASHBOARD}
                variant="secondary"
                className="text-lg font-bold whitespace-nowrap"
                testId="dashboard-logo"
                onClick={closeSidebar}
              >
                Agents Playbook
              </Link>
            )}

            <button
              onClick={toggleCollapse}
              className="hidden lg:block p-1 hover:bg-gray-100 rounded"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname?.startsWith(item.href));

                const linkContent = (
                  <Link
                    href={item.href}
                    variant="secondary"
                    testId={item.testId}
                    onClick={closeSidebar}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50'}
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon fontSize="small" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant="primary" testId="admin-badge">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                );

                return (
                  <li key={item.href}>
                    {isCollapsed ? (
                      <Tooltip content={item.label} placement="right">
                        {linkContent}
                      </Tooltip>
                    ) : (
                      linkContent
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Sign Out */}
          {session?.user && (
            <div className="p-4 border-t border-gray-200">
              {!isCollapsed && (
                <div className="mb-3" data-testid="user-info">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate" data-testid="user-display-name">
                      {session.user.username || session.user.email}
                    </span>
                    {session.user.tier && (
                      <Badge variant="primary" testId="user-tier-badge">
                        {session.user.tier}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
                testId="signout-button"
                className="w-full"
              >
                {isCollapsed ? 'Out' : 'Sign Out'}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
