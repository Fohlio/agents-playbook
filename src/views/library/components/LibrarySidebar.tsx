'use client';

import { useState, MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Folder, Inbox, Trash2, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { FolderWithItems } from '@/server/folders/types';
import { LibraryView } from '../hooks/useLibraryNavigation';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface LibrarySidebarProps {
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
  className?: string;
}

/**
 * LibrarySidebar Component
 *
 * Sidebar navigation for the Library showing:
 * - Folder list with item counts
 * - Uncategorized section
 * - Trash section
 * - Create folder button
 * - Right-click context menu for folders
 */
export function LibrarySidebar({
  folders,
  currentFolderId,
  currentView,
  uncategorizedCount,
  trashCount,
  onFolderClick,
  onUncategorizedClick,
  onTrashClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRootClick,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  className,
}: LibrarySidebarProps) {
  const t = useTranslations('library.sidebar');
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    folderId: string;
  } | null>(null);
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  const handleContextMenu = (event: MouseEvent, folderId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      folderId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextAction = (action: (folderId: string) => void) => {
    if (contextMenu) {
      action(contextMenu.folderId);
    }
    handleCloseContextMenu();
  };

  return (
    <aside
      className={cn(
        'w-44 border-r border-gray-200 bg-gray-50 flex flex-col',
        className
      )}
      data-testid="library-sidebar"
      role="navigation"
      aria-label="Library navigation"
    >
      {/* Header */}
      <div className="p-2 border-b border-gray-200 space-y-0.5">
        {/* Uncategorized */}
        <button
          onClick={onUncategorizedClick}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
            currentView === 'uncategorized'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          )}
          data-testid="sidebar-uncategorized"
        >
          <Inbox className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{t('uncategorized')}</span>
          {uncategorizedCount > 0 && (
            <span className="text-xs text-gray-400">{uncategorizedCount}</span>
          )}
        </button>

        {/* Trash */}
        <button
          onClick={onTrashClick}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-left text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
            currentView === 'trash'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          )}
          data-testid="sidebar-trash"
        >
          <Trash2 className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{t('trash')}</span>
          {trashCount > 0 && (
            <span className="text-xs text-gray-400">{trashCount}</span>
          )}
        </button>
      </div>

      {/* Folders section */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t('folders')}
          </h3>
          <button
            onClick={onCreateFolder}
            className="p-2 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title={t('createFolder')}
            aria-label={t('createFolder')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-0.5" role="list" aria-label={t('foldersListLabel')}>
          {folders.length === 0 ? (
            <p className="text-sm text-gray-400 px-2 py-4">
              {t('noFolders')}
            </p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.id}
                className="relative group"
                role="listitem"
                onMouseEnter={() => setHoveredFolderId(folder.id)}
                onMouseLeave={() => setHoveredFolderId(null)}
              >
                <button
                  onClick={() => onFolderClick(folder.id)}
                  onContextMenu={(e) => handleContextMenu(e, folder.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2 py-1.5 pr-8 rounded-md text-left text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                    currentFolderId === folder.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  data-testid={`sidebar-folder-${folder.id}`}
                  aria-current={currentFolderId === folder.id ? 'page' : undefined}
                  aria-label={`${folder.name} ${t('folder')}, ${folder.itemCount} ${t('items')}`}
                >
                  <Folder className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  <span className="text-xs text-gray-400 tabular-nums flex-shrink-0" aria-hidden="true">
                    {folder.itemCount}
                  </span>
                </button>

                {/* Inline menu button - positioned outside the button text flow */}
                {(hoveredFolderId === folder.id || contextMenu?.folderId === folder.id) && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e as unknown as MouseEvent, folder.id);
                    }}
                    aria-label={`${t('moreOptions')} ${folder.name}`}
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px',
                      minWidth: '28px',
                      minHeight: '28px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(229, 231, 235, 1)',
                      },
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
            ))
          )}
        </nav>
      </div>

      {/* Context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {onRenameFolder && (
          <MenuItem onClick={() => handleContextAction(onRenameFolder)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('rename')}</ListItemText>
          </MenuItem>
        )}
        {onDeleteFolder && (
          <MenuItem
            onClick={() => handleContextAction(onDeleteFolder)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('moveToTrash')}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </aside>
  );
}
