'use client';

import { ReactNode, useState } from 'react';
import { FolderOpen, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { LibrarySidebar } from './LibrarySidebar';
import { FolderWithItems } from '@/server/folders/types';
import { LibraryView } from '../hooks/useLibraryNavigation';

interface LibraryLayoutProps {
  sidebar: {
    folders: FolderWithItems[];
    currentFolderId: string | null;
    currentView: LibraryView;
    uncategorizedCount: number;
    trashCount: number;
    onFolderClick: (folderId: string) => void;
    onUncategorizedClick: () => void;
    onTrashClick: () => void;
    onRootClick: () => void;
    onCreateFolder: () => void;
    onRenameFolder?: (folderId: string) => void;
    onDeleteFolder?: (folderId: string) => void;
  };
  children: ReactNode;
  className?: string;
}

/**
 * LibraryLayout Component - Cyberpunk Style
 *
 * Responsive layout for the Library with dark glass-morphism
 */
export function LibraryLayout({ sidebar, children, className }: LibraryLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarAction = (action: () => void) => {
    action();
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={cn('flex min-h-0 relative', className)}
      data-testid="library-layout"
    >
      {/* Mobile sidebar toggle - Cyberpunk Style */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden absolute top-2 left-2 z-20 p-2 bg-[#0a0a0f]/90 backdrop-blur-sm border border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          aria-label="Open folders menu"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-30"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Cyberpunk Glass Panel */}
      <div
        className={cn(
          'fixed lg:relative z-40 lg:z-auto h-full transition-transform duration-200 lg:top-0',
          isSidebarOpen ? 'translate-x-0 top-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Close button inside sidebar on mobile */}
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-2 right-2 z-50 p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
            aria-label="Close folders menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <LibrarySidebar
          folders={sidebar.folders}
          currentFolderId={sidebar.currentFolderId}
          currentView={sidebar.currentView}
          uncategorizedCount={sidebar.uncategorizedCount}
          trashCount={sidebar.trashCount}
          onFolderClick={(id) => handleSidebarAction(() => sidebar.onFolderClick(id))}
          onUncategorizedClick={() => handleSidebarAction(sidebar.onUncategorizedClick)}
          onTrashClick={() => handleSidebarAction(sidebar.onTrashClick)}
          onRootClick={() => handleSidebarAction(sidebar.onRootClick)}
          onCreateFolder={sidebar.onCreateFolder}
          onRenameFolder={sidebar.onRenameFolder}
          onDeleteFolder={sidebar.onDeleteFolder}
        />
      </div>

      {/* Main content - Dark theme */}
      <main className="flex-1 overflow-y-auto bg-[#050508]">
        <div className="p-6 lg:pl-6 pl-4">{children}</div>
      </main>
    </div>
  );
}
