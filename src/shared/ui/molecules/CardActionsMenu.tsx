"use client";

import { useState, MouseEvent } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  CircularProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ShareIcon from "@mui/icons-material/Share";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddIcon from "@mui/icons-material/Add";

export interface CardActionsMenuProps {
  // Toggle states
  isActive?: boolean;
  isPublic?: boolean;
  onToggleActive?: (checked: boolean) => void;
  onTogglePublic?: (checked: boolean) => void;

  // Action callbacks
  onShare?: () => void;
  onRate?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  onImport?: () => void;

  // Visibility conditions
  showActive?: boolean;
  showPublic?: boolean;
  showShare?: boolean;
  showRate?: boolean;
  showEdit?: boolean;
  showDuplicate?: boolean;
  showRemove?: boolean;
  showImport?: boolean;

  // Loading states
  isDuplicating?: boolean;
  isRemoving?: boolean;
  isImporting?: boolean;

  // Ownership for delete vs remove label
  isOwned?: boolean;

  // Test ID
  testId?: string;
}

/**
 * CardActionsMenu Component
 *
 * A three-dots menu component that consolidates all card actions
 * into a dropdown menu. Used by WorkflowDiscoveryCard and MiniPromptDiscoveryCard.
 *
 * Features:
 * - Toggle switches for Active/Public status
 * - Action menu items with icons
 * - Loading states for async operations
 * - Dividers to separate menu sections
 */
export function CardActionsMenu({
  isActive = false,
  isPublic = false,
  onToggleActive,
  onTogglePublic,
  onShare,
  onRate,
  onEdit,
  onDuplicate,
  onRemove,
  onImport,
  showActive = false,
  showPublic = false,
  showShare = false,
  showRate = false,
  showEdit = false,
  showDuplicate = false,
  showRemove = false,
  showImport = false,
  isDuplicating = false,
  isRemoving = false,
  isImporting = false,
  isOwned = false,
  testId,
}: CardActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: MouseEvent) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleMenuItemClick = (
    event: MouseEvent,
    callback?: () => void
  ) => {
    event.stopPropagation();
    callback?.();
    handleClose();
  };

  const handleToggleClick = (
    event: MouseEvent,
    callback?: (checked: boolean) => void,
    currentValue?: boolean
  ) => {
    event.stopPropagation();
    callback?.(!currentValue);
    // Don't close menu on toggle
  };

  // Check if we have any toggles to show
  const hasToggles = showActive || showPublic;
  
  // Check if we have any actions to show (excluding toggles)
  const hasActions = showShare || showRate || showEdit || showDuplicate || showRemove || showImport;

  // Don't render anything if no actions
  if (!hasToggles && !hasActions) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-label="More actions"
        aria-controls={open ? "card-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        size="small"
        data-testid={testId ? `${testId}-menu-button` : "card-actions-menu-button"}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 1)",
          },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        id="card-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        onClick={(e) => e.stopPropagation()}
        MenuListProps={{
          "aria-labelledby": "card-actions-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        {/* Toggle items */}
        {showActive && (
          <MenuItem
            onClick={(e) => handleToggleClick(e, onToggleActive, isActive)}
            data-testid={testId ? `${testId}-active-toggle` : "card-active-toggle"}
          >
            <ListItemIcon>
              <PowerSettingsNewIcon fontSize="small" color={isActive ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText primary="Active" />
            <Switch
              edge="end"
              checked={isActive}
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onToggleActive?.(e.target.checked);
              }}
            />
          </MenuItem>
        )}

        {showPublic && (
          <MenuItem
            onClick={(e) => handleToggleClick(e, onTogglePublic, isPublic)}
            data-testid={testId ? `${testId}-public-toggle` : "card-public-toggle"}
          >
            <ListItemIcon>
              {isPublic ? (
                <VisibilityIcon fontSize="small" color="primary" />
              ) : (
                <VisibilityOffIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText primary="Public" />
            <Switch
              edge="end"
              checked={isPublic}
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onTogglePublic?.(e.target.checked);
              }}
            />
          </MenuItem>
        )}

        {hasToggles && hasActions && <Divider />}

        {/* Action items */}
        {showShare && (
          <MenuItem
            onClick={(e) => handleMenuItemClick(e, onShare)}
            data-testid={testId ? `${testId}-share` : "card-share-action"}
          >
            <ListItemIcon>
              <ShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Share" />
          </MenuItem>
        )}

        {showRate && (
          <MenuItem
            onClick={(e) => handleMenuItemClick(e, onRate)}
            data-testid={testId ? `${testId}-rate` : "card-rate-action"}
          >
            <ListItemIcon>
              <StarOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Rate" />
          </MenuItem>
        )}

        {showEdit && (
          <MenuItem
            onClick={(e) => handleMenuItemClick(e, onEdit)}
            data-testid={testId ? `${testId}-edit` : "card-edit-action"}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
        )}

        {showDuplicate && (
          <MenuItem
            onClick={(e) => handleMenuItemClick(e, onDuplicate)}
            disabled={isDuplicating}
            data-testid={testId ? `${testId}-duplicate` : "card-duplicate-action"}
          >
            <ListItemIcon>
              {isDuplicating ? (
                <CircularProgress size={20} />
              ) : (
                <ContentCopyIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText primary={isDuplicating ? "Duplicating..." : "Duplicate"} />
          </MenuItem>
        )}

        {showImport && (
          <MenuItem
            onClick={(e) => handleMenuItemClick(e, onImport)}
            disabled={isImporting}
            data-testid={testId ? `${testId}-import` : "card-import-action"}
          >
            <ListItemIcon>
              {isImporting ? (
                <CircularProgress size={20} />
              ) : (
                <AddIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText primary={isImporting ? "Importing..." : "Add to Library"} />
          </MenuItem>
        )}

        {(showShare || showRate || showEdit || showDuplicate || showImport) && showRemove && (
          <Divider />
        )}

        {showRemove && (
          <MenuItem
            onClick={(e) => handleMenuItemClick(e, onRemove)}
            disabled={isRemoving}
            data-testid={testId ? `${testId}-remove` : "card-remove-action"}
            sx={{
              color: "error.main",
              "&:hover": {
                backgroundColor: "error.lighter",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              {isRemoving ? (
                <CircularProgress size={20} color="error" />
              ) : isOwned ? (
                <DeleteIcon fontSize="small" />
              ) : (
                <RemoveCircleOutlineIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                isRemoving
                  ? isOwned
                    ? "Deleting..."
                    : "Removing..."
                  : isOwned
                  ? "Delete"
                  : "Remove from Library"
              }
            />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

