'use client';

import { ReactNode, useState } from 'react';
import { Menu, X } from 'lucide-react';
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
 * LibraryLayout Component
 *
 * Responsive layout for the Library:
 * - Collapsible sidebar with folders navigation (drawer on mobile)
 * - Main content area
 */
export function LibraryLayout({ sidebar, children, className }: LibraryLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarAction = (action: () => void) => {
    action();
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={cn('flex min-h-0 relative', className)}
      data-testid="library-layout"
    >
      {/* Mobile sidebar toggle - positioned to not overlap main burger menu */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-16 z-40 p-2 bg-white rounded-md shadow-md border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isSidebarOpen ? 'Close folders menu' : 'Open folders menu'}
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30 top-16"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - hidden on mobile by default, visible on lg+ */}
      <div
        className={cn(
          'fixed lg:relative z-40 lg:z-auto h-full transition-transform duration-200 top-16 lg:top-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="p-6 lg:pl-6 pl-4">{children}</div>
      </main>
    </div>
  );
}
