"use client";

import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Folder, Plus } from 'lucide-react';
import { FolderWithItems } from '@/server/folders/types';

export interface FolderSelectMenuProps {
  /** Anchor element for the menu */
  anchorEl: HTMLElement | null;
  /** Whether the menu is open */
  open: boolean;
  /** Called when menu should close */
  onClose: () => void;
  /** Available folders to select from */
  folders: FolderWithItems[];
  /** Called when a folder is selected */
  onSelectFolder: (folderId: string) => void;
  /** Called when "Create new folder" is clicked (optional) */
  onCreateFolder?: () => void;
  /** Placement of the menu */
  placement?: 'bottom' | 'right';
}

/**
 * FolderSelectMenu Component
 *
 * Dropdown menu for selecting a folder.
 * Used by context menus and the selection toolbar for:
 * - Add to Folder
 * - Move to Folder
 *
 * Features:
 * - Lists all user folders
 * - Shows item count per folder
 * - Optional "Create new folder" action
 */
export function FolderSelectMenu({
  anchorEl,
  open,
  onClose,
  folders,
  onSelectFolder,
  onCreateFolder,
  placement = 'bottom',
}: FolderSelectMenuProps) {
  const handleFolderClick = (folderId: string) => {
    onSelectFolder(folderId);
    onClose();
  };

  const handleCreateClick = () => {
    if (onCreateFolder) {
      onCreateFolder();
      onClose();
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: placement === 'bottom' ? 'bottom' : 'top',
        horizontal: placement === 'bottom' ? 'left' : 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: 300,
            minWidth: 200,
          },
        },
      }}
    >
      {folders.length === 0 ? (
        <MenuItem disabled>
          <ListItemText
            primary="No folders available"
            secondary="Create a folder first"
            slotProps={{
              primary: { sx: { fontSize: '0.875rem' } },
              secondary: { sx: { fontSize: '0.75rem' } },
            }}
          />
        </MenuItem>
      ) : (
        folders.map((folder) => (
          <MenuItem
            key={folder.id}
            onClick={() => handleFolderClick(folder.id)}
            sx={{ py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Folder className="w-4 h-4 text-blue-500" />
            </ListItemIcon>
            <ListItemText
              primary={folder.name}
              secondary={`${folder.itemCount} ${folder.itemCount === 1 ? 'item' : 'items'}`}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.875rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 180,
                  },
                },
                secondary: { sx: { fontSize: '0.75rem' } },
              }}
            />
          </MenuItem>
        ))
      )}

      {onCreateFolder && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleCreateClick} sx={{ py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Plus className="w-4 h-4 text-gray-500" />
            </ListItemIcon>
            <ListItemText
              primary="Create new folder"
              slotProps={{
                primary: { sx: { fontSize: '0.875rem', color: 'primary.main' } },
              }}
            />
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
