'use client';

import { Folder, Globe, Lock, MoreVertical } from 'lucide-react';
import { useState, MouseEvent, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
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
 * FolderCard Component - Cyberpunk Style
 *
 * Angular folder card with neon accents
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
  const t = useTranslations('folderCard');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: MouseEvent) => {
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

  // Cyberpunk Menu
  const menuComponent = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        '& .MuiPaper-root': {
          backgroundColor: '#0a0a0f',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
        },
        '& .MuiMenuItem-root': {
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: '#a5f3fc',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
          },
        },
      }}
    >
      {onRename && (
        <MenuItem onClick={() => handleMenuAction(() => onRename(folder.id))}>
          <ListItemIcon sx={{ color: '#00ffff' }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('rename')}</ListItemText>
        </MenuItem>
      )}
      {onCopyLink && folder.visibility === 'PUBLIC' && (
        <MenuItem onClick={() => handleMenuAction(() => onCopyLink(folder.id))}>
          <ListItemIcon sx={{ color: '#00ffff' }}>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('copyLink')}</ListItemText>
        </MenuItem>
      )}
      {onDelete && (
        <MenuItem
          onClick={() => handleMenuAction(() => onDelete(folder.id))}
          sx={{ color: '#ff0066 !important' }}
        >
          <ListItemIcon sx={{ color: '#ff0066' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('moveToTrash')}</ListItemText>
        </MenuItem>
      )}
    </Menu>
  );

  // List view - Cyberpunk
  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'relative bg-[#0a0a0f]/80 backdrop-blur-sm border px-4 py-3 transition-all duration-200 cursor-pointer',
          'flex items-center gap-4',
          isSelected
            ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_15px_rgba(255,200,0,0.2)]'
            : 'border-yellow-500/30 hover:border-yellow-400/60 hover:bg-yellow-500/5',
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
        <div className={cn('transition-opacity', isSelected || isHovered ? 'opacity-100' : 'opacity-0')}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-4 h-4 bg-transparent border-2 border-yellow-500/50 text-yellow-500 focus:ring-yellow-500/50"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 flex-shrink-0">
          <Folder className="w-5 h-5 text-yellow-400" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <button
            data-title
            onClick={handleTitleClick}
            className="font-mono text-cyan-100 hover:text-yellow-400 transition-colors focus:outline-none text-left"
            tabIndex={-1}
          >
            {folder.name}/
          </button>
          {folder.description && (
            <p className="text-xs text-cyan-100/40 truncate mt-0.5 font-mono">{folder.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-cyan-100/50 font-mono flex-shrink-0">
          <span className="text-yellow-400">[{folder.itemCount}]</span>
          {folder.visibility === 'PUBLIC' ? (
            <Globe className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-cyan-500/50" aria-hidden="true" />
          )}
        </div>

        <div data-menu className="flex-shrink-0">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label={`Options for ${folder.name}`}
            sx={{
              opacity: isHovered || menuAnchor ? 1 : 0,
              transition: 'opacity 0.2s',
              color: '#00ffff',
              minWidth: '32px',
              minHeight: '32px',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
              },
            }}
          >
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
          </IconButton>
          {menuComponent}
        </div>
      </div>
    );
  }

  // Grid view - Cyberpunk
  return (
    <div
      className={cn(
        'relative bg-[#0a0a0f]/80 backdrop-blur-sm border p-4 transition-all duration-200 cursor-pointer',
        isSelected
          ? 'border-yellow-400 bg-yellow-500/10 shadow-[0_0_20px_rgba(255,200,0,0.2)]'
          : 'border-yellow-500/30 hover:border-yellow-400/60 hover:bg-yellow-500/5',
        className
      )}
      style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
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
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-yellow-500/50"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-yellow-500/50"></div>

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
          className="w-4 h-4 bg-transparent border-2 border-yellow-500/50 text-yellow-500 focus:ring-yellow-500/50"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      <div className="absolute top-2 right-2" data-menu>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          aria-label={`Options for ${folder.name}`}
          sx={{
            opacity: isHovered || menuAnchor ? 1 : 0,
            transition: 'opacity 0.2s',
            color: '#00ffff',
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            minWidth: '32px',
            minHeight: '32px',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.2)',
            },
          }}
        >
          <MoreVertical className="w-4 h-4" aria-hidden="true" />
        </IconButton>
        {menuComponent}
      </div>

      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30">
          <Folder className="w-8 h-8 text-yellow-400" aria-hidden="true" />
        </div>
      </div>

      <button
        data-title
        onClick={handleTitleClick}
        className="w-full text-center font-mono text-cyan-100 hover:text-yellow-400 transition-colors focus:outline-none min-h-[44px] flex items-center justify-center px-1 break-words"
        style={{ wordBreak: 'break-word' }}
        tabIndex={-1}
      >
        {folder.name}/
      </button>

      <div className="flex items-center justify-center gap-2 mt-2 text-xs font-mono">
        <span className="text-yellow-400">[{folder.itemCount}]</span>
        {folder.visibility === 'PUBLIC' ? (
          <span title="Public folder" aria-label="Public folder">
            <Globe className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
          </span>
        ) : (
          <span title="Private folder" aria-label="Private folder">
            <Lock className="w-3.5 h-3.5 text-cyan-500/50" aria-hidden="true" />
          </span>
        )}
      </div>

      {folder.description && (
        <p className="mt-2 text-xs text-cyan-100/30 text-center line-clamp-2 font-mono">
          {folder.description}
        </p>
      )}
    </div>
  );
}
