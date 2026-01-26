"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/shared/ui/atoms";
import { LanguageSwitcher } from "@/shared/ui/molecules/LanguageSwitcher";
import { ROUTES, PROTECTED_ROUTES } from "@/shared/routes";
import { useShareCount } from "@/features/sharing/hooks/useShareCount";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExploreIcon from '@mui/icons-material/Explore';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ShareIcon from '@mui/icons-material/Share';
import ForumIcon from '@mui/icons-material/Forum';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

/**
 * Dashboard Sidebar - Cyberpunk Style
 *
 * Drawer-style navigation with neon accents and glass-morphism
 */
export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'ADMIN';
  const { count: shareCount } = useShareCount();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navItems = [
    { href: ROUTES.GETTING_STARTED, labelKey: 'gettingStarted', icon: RocketLaunchIcon, testId: 'getting-started-nav-link' },
    { href: ROUTES.DASHBOARD, labelKey: 'dashboard', icon: DashboardIcon, testId: 'dashboard-nav-link' },
    { href: ROUTES.DISCOVER, labelKey: 'discover', icon: ExploreIcon, testId: 'discover-nav-link' },
    { href: PROTECTED_ROUTES.LIBRARY, labelKey: 'library', icon: LibraryBooksIcon, testId: 'library-nav-link' },
    { href: PROTECTED_ROUTES.SKILLS_STUDIO, labelKey: 'skills', icon: AutoAwesomeIcon, testId: 'skills-nav-link' },
    { href: PROTECTED_ROUTES.SHARING, labelKey: 'myShares', icon: ShareIcon, testId: 'sharing-nav-link', badgeCount: shareCount },
    { href: PROTECTED_ROUTES.COMMUNITY, labelKey: 'community', icon: ForumIcon, testId: 'community-nav-link' },
    ...(isAdmin ? [{ href: ROUTES.ADMIN.SYSTEM_WORKFLOWS, labelKey: 'admin', icon: AdminPanelSettingsIcon, testId: 'admin-nav-link', badge: tCommon('system') }] : []),
    { href: ROUTES.SETTINGS, labelKey: 'settings', icon: SettingsIcon, testId: 'settings-nav-link' },
  ];

  return (
    <>
      {/* Burger Menu Button - Cyberpunk Style */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-[#0a0a0f]/90 backdrop-blur-sm border border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          aria-label={t('toggleMenu')}
        >
          <MenuIcon />
        </button>
      )}

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-70 bg-black pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar - Cyberpunk Glass Panel */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#0a0a0f]/95 backdrop-blur-md border-r border-cyan-500/30 z-40
          transition-all duration-300 ease-in-out w-72
          ${isOpen ? 'translate-x-0 shadow-[0_0_50px_rgba(0,255,255,0.1)]' : '-translate-x-full'}
        `}
      >
        {/* Circuit pattern inside sidebar */}
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
        
        {/* Neon glow line on right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>
        
        <div className="relative flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <Link
              href={ROUTES.DASHBOARD}
              variant="secondary"
              className="text-lg font-bold whitespace-nowrap font-mono tracking-tight"
              testId="dashboard-logo"
              onClick={closeSidebar}
            >
              <span className="text-cyan-400" style={{ textShadow: '0 0 10px #00ffff' }}>AGENTS</span>
              <span className="text-pink-400 ml-1" style={{ textShadow: '0 0 10px #ff0066' }}>PLAYBOOK</span>
            </Link>

            <button
              onClick={closeSidebar}
              className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              aria-label={t('toggleMenu')}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname?.startsWith(item.href));

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      variant="secondary"
                      testId={item.testId}
                      onClick={closeSidebar}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 transition-all duration-200 font-mono text-sm uppercase tracking-wider
                        ${isActive 
                          ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.1)]' 
                          : 'text-cyan-100/60 hover:text-cyan-400 hover:bg-cyan-500/10 border-l-2 border-transparent'}
                      `}
                    >
                      <Icon fontSize="small" className={isActive ? 'text-cyan-400' : ''} />
                      <span className="flex-1">{t(item.labelKey)}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50">
                          {item.badge}
                        </span>
                      )}
                      {item.badgeCount !== undefined && item.badgeCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                          {item.badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Sign Out */}
          {session?.user && (
            <div className="p-4 border-t border-cyan-500/20">
              <div className="mb-3" data-testid="user-info">
                <div className="flex items-center gap-2 mb-2">
                  <LanguageSwitcher variant="compact" />
                  <span className="text-sm font-mono text-cyan-100/80 truncate flex-1" data-testid="user-display-name">
                    {session.user.username || session.user.email}
                  </span>
                  {session.user.tier && (
                    <span className="px-2 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/50">
                      {session.user.tier}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: ROUTES.HOME })}
                data-testid="signout-button"
                className="w-full py-2 px-4 bg-[#050508] border border-pink-500/50 text-pink-400 font-mono text-sm uppercase tracking-wider hover:bg-pink-500/10 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(255,0,102,0.2)] transition-all"
              >
                {t('signOut')}
              </button>
            </div>
          )}

          {/* System Status */}
          <div className="p-4 border-t border-cyan-500/20">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 10px #00ff66' }}></span>
              <span className="text-green-400">{t('systemOnline')}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
