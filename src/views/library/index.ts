/**
 * Library V2 View Exports
 *
 * New file-system-like Library interface with folder organization,
 * trash management, and multi-folder membership.
 */

// Main page component
export { LibraryPage } from './LibraryPage';

// Hooks
export { useLibraryNavigation } from './hooks/useLibraryNavigation';
export type { LibraryView, LibraryTab } from './hooks/useLibraryNavigation';

export { useSelection } from './hooks/useSelection';
export type {
  SelectableItem,
  SelectableItemType,
  UseSelectionOptions,
  UseSelectionReturn,
} from './hooks/useSelection';

export { useLibrarySearch, useMultiListSearch } from './hooks/useLibrarySearch';
export type {
  SearchableItem,
  UseLibrarySearchOptions,
  UseLibrarySearchReturn,
  UseMultiListSearchReturn,
} from './hooks/useLibrarySearch';

// Components
export { FolderContentsView } from './components/FolderContentsView';
export { FolderCard } from './components/FolderCard';
export { SelectionToolbar } from './components/SelectionToolbar';
export { FolderSelectMenu } from './components/FolderSelectMenu';
export { ItemContextMenu } from './components/ItemContextMenu';
export { TrashView } from './components/TrashView';
export { OnboardingTooltip, OnboardingHighlight, useOnboardingDismissed, useDismissOnboarding, resetAllOnboarding } from './components/OnboardingTooltip';
export {
  EmptyLibraryState,
  EmptyFolderState,
  UncategorizedPromptState,
  EmptyTrashState,
  NoSearchResultsState,
  EmptyDiscoverState,
  EmptyRootState,
  LoadingState,
} from './components/LibraryEmptyStates';

// Server Actions
export {
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
  addToFolderAction,
  removeFromFolderAction,
  moveToFolderAction,
  bulkMoveToTrashAction,
  getUserFoldersAction,
} from './actions/folder-actions';

export {
  restoreItemAction,
  permanentDeleteAction,
  emptyTrashAction,
  bulkRestoreAction,
  bulkPermanentDeleteAction,
  getTrashCountAction,
} from './actions/trash-actions';
