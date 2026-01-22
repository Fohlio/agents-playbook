"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Eye,
  ExternalLink,
  FolderPlus,
  FolderInput,
  FolderMinus,
  Trash2,
  Copy,
  Edit,
  Link2,
  FolderOpen,
} from 'lucide-react';
import { FolderWithItems } from '@/server/folders/types';
import { FolderSelectMenu } from './FolderSelectMenu';
import { SelectableItemType } from '../hooks/useSelection';

export interface ContextMenuPosition {
  mouseX: number;
  mouseY: number;
}

export interface ContextMenuItem {
  id: string;
  type: SelectableItemType;
  name: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export interface ItemContextMenuProps {
  /** Position of the context menu */
  position: ContextMenuPosition | null;
  /** The item(s) being acted upon */
  items: ContextMenuItem[];
  /** Available folders for move/add operations */
  folders: FolderWithItems[];
  /** Current folder ID (for "remove from folder" action) */
  currentFolderId?: string | null;
  /** Whether we're in a folder view */
  isInFolderView?: boolean;
  /** Called when menu should close */
  onClose: () => void;
  /** Called when "Preview" is clicked (workflows/prompts only) */
  onPreview?: (itemId: string) => void;
  /** Called when "Open" or "Open in Prompt Studio" is clicked */
  onOpen?: (itemId: string) => void;
  /** Called when "Rename" is clicked (folders only) */
  onRename?: (itemId: string) => void;
  /** Called when "Add to Folder" is selected */
  onAddToFolder?: (folderId: string, items: ContextMenuItem[]) => void;
  /** Called when "Move to Folder" is selected */
  onMoveToFolder?: (folderId: string, items: ContextMenuItem[]) => void;
  /** Called when "Remove from Folder" is clicked */
  onRemoveFromFolder?: (items: ContextMenuItem[]) => void;
  /** Called when "Move to Trash" is clicked */
  onMoveToTrash?: (items: ContextMenuItem[]) => void;
  /** Called when "Duplicate" is clicked */
  onDuplicate?: (itemId: string) => void;
  /** Called when "Copy Link" is clicked */
  onCopyLink?: (itemId: string) => void;
  /** Called when "Create new folder" is clicked */
  onCreateFolder?: () => void;
}

/**
 * ItemContextMenu Component
 *
 * Context menu for library items (folders, workflows, prompts).
 * Shows different options based on:
 * - Item type (folder vs workflow/prompt)
 * - Selection count (single vs multi)
 * - Current view (folder view vs root)
 * - Item visibility (public vs private)
 */
export function ItemContextMenu({
  position,
  items,
  folders,
  currentFolderId,
  isInFolderView = false,
  onClose,
  onPreview,
  onOpen,
  onRename,
  onAddToFolder,
  onMoveToFolder,
  onRemoveFromFolder,
  onMoveToTrash,
  onDuplicate,
  onCopyLink,
  onCreateFolder,
}: ItemContextMenuProps) {
  const t = useTranslations('itemContextMenu');
  const [addFolderAnchor, setAddFolderAnchor] = useState<HTMLElement | null>(null);
  const [moveFolderAnchor, setMoveFolderAnchor] = useState<HTMLElement | null>(null);

  const isOpen = position !== null;
  const isMultiSelect = items.length > 1;
  const singleItem = items.length === 1 ? items[0] : null;
  const isFolderItem = singleItem?.type === 'folder';
  const isWorkflowOrPrompt = singleItem?.type === 'workflow' || singleItem?.type === 'prompt';
  const isPublic = singleItem?.visibility === 'PUBLIC';

  // Filter out current folder from available folders
  const availableFolders = folders.filter((f) => f.id !== currentFolderId);

  const handleClose = () => {
    setAddFolderAnchor(null);
    setMoveFolderAnchor(null);
    onClose();
  };

  const handleAddToFolder = (folderId: string) => {
    if (onAddToFolder) {
      onAddToFolder(folderId, items);
    }
    handleClose();
  };

  const handleMoveToFolder = (folderId: string) => {
    if (onMoveToFolder) {
      onMoveToFolder(folderId, items);
    }
    handleClose();
  };

  return (
    <>
      <Menu
        open={isOpen}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          position ? { top: position.mouseY, left: position.mouseX } : undefined
        }
      >
        {/* Single item actions */}
        {!isMultiSelect && (
          <>
            {/* Folder-specific actions */}
            {isFolderItem && (
              <>
                {onOpen && (
                  <MenuItem
                    onClick={() => {
                      onOpen(singleItem!.id);
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <FolderOpen className="w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText>{t('open')}</ListItemText>
                  </MenuItem>
                )}
                {onRename && (
                  <MenuItem
                    onClick={() => {
                      onRename(singleItem!.id);
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <Edit className="w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText>{t('rename')}</ListItemText>
                  </MenuItem>
                )}
                {onCopyLink && isPublic && (
                  <MenuItem
                    onClick={() => {
                      onCopyLink(singleItem!.id);
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <Link2 className="w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText>{t('copyLink')}</ListItemText>
                  </MenuItem>
                )}
                <Divider sx={{ my: 0.5 }} />
              </>
            )}

            {/* Workflow/Prompt-specific actions */}
            {isWorkflowOrPrompt && (
              <>
                {onPreview && (
                  <MenuItem
                    onClick={() => {
                      onPreview(singleItem!.id);
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <Eye className="w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText>{t('preview')}</ListItemText>
                  </MenuItem>
                )}
                {onOpen && (
                  <MenuItem
                    onClick={() => {
                      onOpen(singleItem!.id);
                      handleClose();
                    }}
                  >
                    <ListItemIcon>
                      <ExternalLink className="w-4 h-4" />
                    </ListItemIcon>
                    <ListItemText>
                      {singleItem?.type === 'prompt' ? t('openInPromptStudio') : t('editWorkflow')}
                    </ListItemText>
                  </MenuItem>
                )}
                <Divider sx={{ my: 0.5 }} />
              </>
            )}
          </>
        )}

        {/* Folder operations (for workflows/prompts) */}
        {(!isFolderItem || isMultiSelect) && (
          <>
            {/* Add to Folder */}
            {onAddToFolder && (
              <MenuItem
                onClick={(e) => setAddFolderAnchor(e.currentTarget)}
                disabled={availableFolders.length === 0 && !onCreateFolder}
              >
                <ListItemIcon>
                  <FolderPlus className="w-4 h-4" />
                </ListItemIcon>
                <ListItemText>{t('addToFolder')}</ListItemText>
              </MenuItem>
            )}

            {/* Move to Folder */}
            {onMoveToFolder && (
              <MenuItem
                onClick={(e) => setMoveFolderAnchor(e.currentTarget)}
                disabled={availableFolders.length === 0 && !onCreateFolder}
              >
                <ListItemIcon>
                  <FolderInput className="w-4 h-4" />
                </ListItemIcon>
                <ListItemText>{t('moveToFolder')}</ListItemText>
              </MenuItem>
            )}

            {/* Remove from Folder */}
            {isInFolderView && currentFolderId && onRemoveFromFolder && (
              <MenuItem
                onClick={() => {
                  onRemoveFromFolder(items);
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <FolderMinus className="w-4 h-4" />
                </ListItemIcon>
                <ListItemText>{t('removeFromFolder')}</ListItemText>
              </MenuItem>
            )}

            <Divider sx={{ my: 0.5 }} />
          </>
        )}

        {/* Duplicate (single workflow/prompt only) */}
        {!isMultiSelect && isWorkflowOrPrompt && onDuplicate && (
          <MenuItem
            onClick={() => {
              onDuplicate(singleItem!.id);
              handleClose();
            }}
          >
            <ListItemIcon>
              <Copy className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText>{t('duplicate')}</ListItemText>
          </MenuItem>
        )}

        {/* Move to Trash */}
        {onMoveToTrash && (
          <MenuItem
            onClick={() => {
              onMoveToTrash(items);
              handleClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Trash2 className="w-4 h-4" />
            </ListItemIcon>
            <ListItemText>{t('moveToTrash')}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Add to Folder submenu */}
      <FolderSelectMenu
        anchorEl={addFolderAnchor}
        open={Boolean(addFolderAnchor)}
        onClose={() => setAddFolderAnchor(null)}
        folders={availableFolders}
        onSelectFolder={handleAddToFolder}
        onCreateFolder={onCreateFolder}
        placement="right"
      />

      {/* Move to Folder submenu */}
      <FolderSelectMenu
        anchorEl={moveFolderAnchor}
        open={Boolean(moveFolderAnchor)}
        onClose={() => setMoveFolderAnchor(null)}
        folders={availableFolders}
        onSelectFolder={handleMoveToFolder}
        onCreateFolder={onCreateFolder}
        placement="right"
      />
    </>
  );
}
