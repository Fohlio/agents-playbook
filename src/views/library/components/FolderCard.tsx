'use client';

import { Folder, Globe, Lock, MoreVertical } from 'lucide-react';
import { useState, MouseEvent, KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import { Visibility } from '@prisma/client';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export interface FolderCardData {
  id: string;
  name: string;
  key: string | null;
  description: string | null;
  visibility: Visibility;
  itemCount: number;
}

interface FolderCardProps {
  folder: FolderCardData;
  isSelected: boolean;
  onSelect: (folderId: string, event: MouseEvent) => void;
  onOpen: (folderId: string) => void;
  onRename?: (folderId: string) => void;
  onDelete?: (folderId: string) => void;
  onCopyLink?: (folderId: string) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

/**
 * FolderCard Component
 *
 * Displays a folder in the Library grid view.
 * Features:
 * - Click on title to drill into folder
 * - Click on card body to select (for bulk operations)
 * - Selection checkbox shown on hover or when selected
 * - Context menu for folder actions
 */
export function FolderCard({
  folder,
  isSelected,
  onSelect,
  onOpen,
  onRename,
  onDelete,
  onCopyLink,
  viewMode = 'grid',
  className,
}: FolderCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: MouseEvent) => {
    // Don't select if clicking on menu or title
    if (
      (e.target as HTMLElement).closest('[data-menu]') ||
      (e.target as HTMLElement).closest('[data-title]')
    ) {
      return;
    }
    onSelect(folder.id, e);
  };

  const handleTitleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onOpen(folder.id);
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.preventDefault();
    onOpen(folder.id);
  };

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMenuAction = (action: () => void) => {
    handleMenuClose();
    action();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      onOpen(folder.id);
    } else if (e.key === ' ') {
      e.preventDefault();
      onSelect(folder.id, e as unknown as MouseEvent);
    }
  };

  // Menu component (shared between views)
  const menuComponent = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {onRename && (
        <MenuItem onClick={() => handleMenuAction(() => onRename(folder.id))}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
      )}
      {onCopyLink && folder.visibility === 'PUBLIC' && (
        <MenuItem onClick={() => handleMenuAction(() => onCopyLink(folder.id))}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      )}
      {onDelete && (
        <MenuItem
          onClick={() => handleMenuAction(() => onDelete(folder.id))}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move to Trash</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'relative bg-white rounded-lg border px-4 py-3 transition-all duration-200 cursor-pointer',
          'hover:shadow-sm hover:border-gray-300',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'flex items-center gap-4',
          isSelected && 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
          className
        )}
        onClick={handleCardClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`folder-card-${folder.id}`}
        role="listitem"
        tabIndex={0}
        aria-label={`${folder.name} folder, ${folder.itemCount} ${folder.itemCount === 1 ? 'item' : 'items'}, ${folder.visibility === 'PUBLIC' ? 'public' : 'private'}${isSelected ? ', selected' : ''}`}
      >
        {/* Selection checkbox */}
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Folder icon */}
        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
          <Folder className="w-5 h-5 text-blue-500" aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <button
            data-title
            onClick={handleTitleClick}
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors focus:outline-none focus:underline text-left"
            tabIndex={-1}
          >
            {folder.name}
          </button>
          {folder.description && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{folder.description}</p>
          )}
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
          <span>{folder.itemCount} {folder.itemCount === 1 ? 'item' : 'items'}</span>
          {folder.visibility === 'PUBLIC' ? (
            <Globe className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          )}
        </div>

        {/* Menu button */}
        <div data-menu className="flex-shrink-0">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label={`Options for ${folder.name}`}
            sx={{
              opacity: isHovered || menuAnchor ? 1 : 0,
              transition: 'opacity 0.2s',
              minWidth: '32px',
              minHeight: '32px',
            }}
          >
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
          </IconButton>
          {menuComponent}
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-gray-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected && 'border-blue-500 bg-blue-50 ring-2 ring-blue-200',
        className
      )}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`folder-card-${folder.id}`}
      role="listitem"
      tabIndex={0}
      aria-label={`${folder.name} folder, ${folder.itemCount} ${folder.itemCount === 1 ? 'item' : 'items'}, ${folder.visibility === 'PUBLIC' ? 'public' : 'private'}${isSelected ? ', selected' : ''}`}
    >
      {/* Selection checkbox */}
      <div
        className={cn(
          'absolute top-3 left-3 transition-opacity',
          isSelected || isHovered ? 'opacity-100' : 'opacity-0'
        )}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Menu button */}
      <div className="absolute top-2 right-2" data-menu>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          aria-label={`Options for ${folder.name}`}
          sx={{
            opacity: isHovered || menuAnchor ? 1 : 0,
            transition: 'opacity 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            minWidth: '36px',
            minHeight: '36px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          <MoreVertical className="w-4 h-4" aria-hidden="true" />
        </IconButton>
        {menuComponent}
      </div>

      {/* Folder icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Folder className="w-8 h-8 text-blue-500" aria-hidden="true" />
        </div>
      </div>

      {/* Folder name (clickable for drill-down) */}
      <button
        data-title
        onClick={handleTitleClick}
        className="w-full text-center font-medium text-gray-900 hover:text-blue-600 transition-colors focus:outline-none focus:underline min-h-[44px] flex items-center justify-center px-1 break-words"
        style={{ wordBreak: 'break-word' }}
        tabIndex={-1}
      >
        {folder.name}
      </button>

      {/* Item count and visibility */}
      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
        <span>
          {folder.itemCount} {folder.itemCount === 1 ? 'item' : 'items'}
        </span>
        {folder.visibility === 'PUBLIC' ? (
          <span title="Public folder" aria-label="Public folder">
            <Globe className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
          </span>
        ) : (
          <span title="Private folder" aria-label="Private folder">
            <Lock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Description (if present) */}
      {folder.description && (
        <p className="mt-2 text-xs text-gray-400 text-center line-clamp-2">
          {folder.description}
        </p>
      )}
    </div>
  );
}
