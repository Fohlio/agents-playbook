'use client';

import { useState, useEffect, useCallback, MouseEvent, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LibraryLayout } from './components/LibraryLayout';
import { LibraryHeader } from './components/LibraryHeader';
import { Breadcrumbs, BreadcrumbItem } from './components/Breadcrumbs';
import { FolderContentsView } from './components/FolderContentsView';
import { SelectionToolbar } from './components/SelectionToolbar';
import { ItemContextMenu, ContextMenuPosition, ContextMenuItem } from './components/ItemContextMenu';
import { TrashView } from './components/TrashView';
import { DiscoverView } from './components/DiscoverView';
import { UncategorizedPromptState } from './components/LibraryEmptyStates';
import { PromptPreviewModal } from './components/PromptPreviewModal';
import { useLibraryNavigation } from './hooks/useLibraryNavigation';
import { useSelection, SelectableItem } from './hooks/useSelection';
import { FolderWithItems, WorkflowWithMeta, PromptWithMeta, TrashedItem } from '@/server/folders/types';
import { Tabs } from '@/shared/ui/molecules/Tabs';
import { ROUTES } from '@/shared/routes';
import {
  createFolderAction,
  renameFolderAction,
  deleteFolderAction,
  addToFolderAction,
  removeFromFolderAction,
  moveToFolderAction,
  bulkMoveToTrashAction,
} from './actions/folder-actions';
import {
  restoreItemAction,
  permanentDeleteAction,
  emptyTrashAction,
  bulkRestoreAction,
  bulkPermanentDeleteAction,
} from './actions/trash-actions';
import {
  importWorkflowAction,
  importPromptAction,
} from './actions/discover-actions';

/**
 * LibraryPage Component (V2)
 *
 * Main page component for the new Library with file-system interface.
 * Features:
 * - Two tabs: My Library | Discover
 * - Sidebar navigation with folders
 * - URL-based navigation state
 * - Selection mechanics for bulk operations
 * - Context menu for item actions
 * - Trash management with restore/delete
 */
export function LibraryPage() {
  const t = useTranslations('library');
  const tNav = useTranslations('nav');
  const tBreadcrumbs = useTranslations('breadcrumbs');
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigation = useLibraryNavigation();

  // Data state
  const [folders, setFolders] = useState<FolderWithItems[]>([]);
  const [currentFolderData, setCurrentFolderData] = useState<{
    workflows: WorkflowWithMeta[];
    prompts: PromptWithMeta[];
  }>({ workflows: [], prompts: [] });
  const [uncategorizedData, setUncategorizedData] = useState<{
    workflows: WorkflowWithMeta[];
    prompts: PromptWithMeta[];
  }>({ workflows: [], prompts: [] });
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<FolderWithItems | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: ContextMenuPosition | null;
    items: ContextMenuItem[];
  }>({ position: null, items: [] });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewPrompt, setPreviewPrompt] = useState<PromptWithMeta | null>(null);

  // Check for prompt preview from URL
  useEffect(() => {
    const promptId = searchParams.get('prompt');
    if (promptId) {
      // Find the prompt in current data
      const allPrompts = [...uncategorizedData.prompts, ...currentFolderData.prompts];
      const prompt = allPrompts.find(p => p.id === promptId);
      if (prompt) {
        setPreviewPrompt(prompt);
      }
    }
  }, [searchParams, uncategorizedData.prompts, currentFolderData.prompts]);

  // Build selectable items list for the selection hook
  const selectableItems = useMemo((): SelectableItem[] => {
    const items: SelectableItem[] = [];

    // In root view, include folders
    if (navigation.view === 'root') {
      folders.forEach((f) => items.push({ id: f.id, type: 'folder' }));
    }

    // Add workflows and prompts based on current view
    const viewData =
      navigation.view === 'trash'
        ? { workflows: [], prompts: [] } // Trash has its own selection
        : navigation.view === 'uncategorized'
          ? uncategorizedData
          : navigation.currentFolderId
            ? currentFolderData
            : uncategorizedData;

    viewData.workflows.forEach((w) => items.push({ id: w.id, type: 'workflow' }));
    viewData.prompts.forEach((p) => items.push({ id: p.id, type: 'prompt' }));

    return items;
  }, [
    navigation.view,
    navigation.currentFolderId,
    folders,
    uncategorizedData,
    currentFolderData,
  ]);

  // Initialize selection hook
  const selection = useSelection(selectableItems, {
    onDeleteRequest: handleBulkDelete,
  });

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/folders');
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  }, []);

  // Fetch folder contents
  const fetchFolderContents = useCallback(
    async (folderId: string) => {
      try {
        const response = await fetch(`/api/folders/${folderId}/contents`);
        if (response.ok) {
          const data = await response.json();
          setCurrentFolderData({
            workflows: data.workflows || [],
            prompts: data.prompts || [],
          });
          // Find and set current folder
          const folder = folders.find((f) => f.id === folderId);
          setCurrentFolder(folder || null);
        }
      } catch (error) {
        console.error('Failed to fetch folder contents:', error);
      }
    },
    [folders]
  );

  // Fetch uncategorized items
  const fetchUncategorized = useCallback(async () => {
    try {
      const response = await fetch('/api/folders/uncategorized');
      if (response.ok) {
        const data = await response.json();
        setUncategorizedData({
          workflows: data.workflows || [],
          prompts: data.prompts || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch uncategorized items:', error);
    }
  }, []);

  // Fetch trashed items
  const fetchTrash = useCallback(async () => {
    try {
      const response = await fetch('/api/folders/trash');
      if (response.ok) {
        const data = await response.json();
        setTrashedItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch trash:', error);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchFolders(), fetchUncategorized(), fetchTrash()]);
    if (navigation.currentFolderId) {
      await fetchFolderContents(navigation.currentFolderId);
    }
  }, [fetchFolders, fetchUncategorized, fetchTrash, fetchFolderContents, navigation.currentFolderId]);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchFolders();
      await fetchUncategorized();
      await fetchTrash();
      setIsLoading(false);
    };
    loadData();
  }, [fetchFolders, fetchUncategorized, fetchTrash]);

  // Fetch content based on navigation
  useEffect(() => {
    if (navigation.currentFolderId) {
      fetchFolderContents(navigation.currentFolderId);
    } else {
      setCurrentFolder(null);
      setCurrentFolderData({ workflows: [], prompts: [] });
    }
  }, [navigation.currentFolderId, fetchFolderContents]);

  // Clear selection when navigation changes
  // Note: selection.clearSelection is intentionally omitted from deps
  // as it would cause infinite re-renders (clearSelection is stable but selection object changes)
  useEffect(() => {
    selection.clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.currentFolderId, navigation.view]);

  // Compute counts
  const uncategorizedCount =
    uncategorizedData.workflows.length + uncategorizedData.prompts.length;
  const trashCount = trashedItems.length;

  // Build breadcrumbs
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { id: 'home', label: tBreadcrumbs('myLibrary'), type: 'home' },
    ];

    if (navigation.view === 'trash') {
      items.push({ id: 'trash', label: tBreadcrumbs('trash'), type: 'trash' });
    } else if (navigation.view === 'uncategorized') {
      items.push({
        id: 'uncategorized',
        label: tBreadcrumbs('uncategorized'),
        type: 'uncategorized',
      });
    } else if (currentFolder) {
      items.push({
        id: currentFolder.id,
        label: currentFolder.name,
        type: 'folder',
      });
    }

    return items;
  }, [navigation.view, currentFolder, tBreadcrumbs]);

  // Get current view data
  const currentViewData = useMemo(() => {
    if (navigation.view === 'uncategorized') {
      return uncategorizedData;
    }

    if (navigation.currentFolderId) {
      return currentFolderData;
    }

    // Root view - show only uncategorized
    return uncategorizedData;
  }, [
    navigation.view,
    navigation.currentFolderId,
    uncategorizedData,
    currentFolderData,
  ]);

  // Selection handlers
  const handleSelectItem = useCallback(
    (id: string, type: 'folder' | 'workflow' | 'prompt', event: MouseEvent) => {
      selection.handleItemClick(id, event);
    },
    [selection]
  );

  // Context menu handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleContextMenu = useCallback(
    (
      event: MouseEvent,
      items: { id: string; type: 'folder' | 'workflow' | 'prompt'; name: string; visibility?: 'PUBLIC' | 'PRIVATE' }[]
    ) => {
      event.preventDefault();
      setContextMenu({
        position: { mouseX: event.clientX, mouseY: event.clientY },
        items,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ position: null, items: [] });
  }, []);

  // Navigation handlers
  const handleBreadcrumbNavigate = useCallback(
    (item: BreadcrumbItem) => {
      if (item.type === 'home') {
        navigation.navigateToRoot();
      } else if (item.type === 'folder') {
        navigation.navigateToFolder(item.id);
      }
    },
    [navigation]
  );

  // Action handlers
  const handleCreateFolder = useCallback(async () => {
    const name = prompt(t('prompts.enterFolderName'));
    if (!name) return;

    const result = await createFolderAction(name);
    if (result.success) {
      await fetchFolders();
    } else {
      alert(result.error || t('errors.failedToCreateFolder'));
    }
  }, [fetchFolders, t]);

  const handleRenameFolder = useCallback(
    async (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;

      const newName = prompt(t('prompts.enterNewFolderName'), folder.name);
      if (!newName || newName === folder.name) return;

      const result = await renameFolderAction(folderId, newName);
      if (result.success) {
        await fetchFolders();
      } else {
        alert(result.error || t('errors.failedToRenameFolder'));
      }
    },
    [folders, fetchFolders, t]
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      if (!confirm(t('prompts.confirmMoveToTrash'))) return;

      const result = await deleteFolderAction(folderId);
      if (result.success) {
        await refreshData();
        if (navigation.currentFolderId === folderId) {
          navigation.navigateToRoot();
        }
      } else {
        alert(result.error || t('errors.failedToDeleteFolder'));
      }
    },
    [refreshData, navigation, t]
  );

  const handleCreateWorkflow = useCallback(() => {
    router.push(ROUTES.LIBRARY.WORKFLOWS.NEW);
  }, [router]);

  const handleCreatePrompt = useCallback(() => {
    router.push(ROUTES.LIBRARY.MINI_PROMPTS.NEW);
  }, [router]);

  const handleOpenWorkflow = useCallback(
    (workflowId: string) => {
      router.push(ROUTES.LIBRARY.WORKFLOWS.EDIT(workflowId));
    },
    [router]
  );

  const handleOpenPrompt = useCallback(
    (promptId: string) => {
      // Find the prompt and show preview modal
      const allPrompts = [...uncategorizedData.prompts, ...currentFolderData.prompts];
      const prompt = allPrompts.find(p => p.id === promptId);
      if (prompt) {
        setPreviewPrompt(prompt);
      }
    },
    [uncategorizedData.prompts, currentFolderData.prompts]
  );

  const handleClosePromptPreview = useCallback(() => {
    setPreviewPrompt(null);
    // Remove prompt param from URL if present
    const url = new URL(window.location.href);
    url.searchParams.delete('prompt');
    router.replace(url.pathname + url.search);
  }, [router]);

  // Helper to get selected workflows/prompts mapped to server action format
  const getSelectedFolderItems = useCallback(() => {
    return selection.getSelectedItems()
      .filter((item) => item.type === 'workflow' || item.type === 'prompt')
      .map((item) => ({
        type: item.type === 'workflow' ? ('WORKFLOW' as const) : ('MINI_PROMPT' as const),
        id: item.id,
      }));
  }, [selection]);

  // Bulk operations
  const handleAddToFolder = useCallback(
    async (folderId: string) => {
      const items = getSelectedFolderItems();
      if (items.length === 0) return;

      const result = await addToFolderAction(folderId, items);
      if (result.success) {
        selection.clearSelection();
        await refreshData();
      } else {
        alert(result.error || t('errors.failedToAddToFolder'));
      }
    },
    [getSelectedFolderItems, selection, refreshData, t]
  );

  const handleMoveToFolder = useCallback(
    async (folderId: string) => {
      const items = getSelectedFolderItems();
      if (items.length === 0) return;

      const result = await moveToFolderAction(
        folderId,
        items,
        navigation.currentFolderId || undefined
      );
      if (result.success) {
        selection.clearSelection();
        await refreshData();
      } else {
        alert(result.error || t('errors.failedToMoveItems'));
      }
    },
    [getSelectedFolderItems, selection, refreshData, navigation.currentFolderId, t]
  );

  const handleRemoveFromFolder = useCallback(async () => {
    if (!navigation.currentFolderId) return;

    const items = getSelectedFolderItems();
    if (items.length === 0) return;

    const result = await removeFromFolderAction(navigation.currentFolderId, items);
    if (result.success) {
      selection.clearSelection();
      await refreshData();
    } else {
      alert(result.error || t('errors.failedToRemoveFromFolder'));
    }
  }, [getSelectedFolderItems, selection, refreshData, navigation.currentFolderId, t]);

  async function handleBulkDelete() {
    const items = selection.getSelectedItems().map((item) => ({
      type:
        item.type === 'folder'
          ? ('FOLDER' as const)
          : item.type === 'workflow'
            ? ('WORKFLOW' as const)
            : ('MINI_PROMPT' as const),
      id: item.id,
    }));

    if (items.length === 0) return;

    if (!confirm(t('prompts.confirmMoveItemsToTrash', { count: items.length }))) return;

    const result = await bulkMoveToTrashAction(items);
    if (result.success) {
      selection.clearSelection();
      await refreshData();
    } else {
      alert(result.error || t('errors.failedToMoveToTrash'));
    }
  }

  // Helper to map ContextMenuItems to folder action format (excludes folders)
  const mapContextItemsToFolderItems = (items: ContextMenuItem[]) => {
    return items
      .filter((i) => i.type !== 'folder')
      .map((item) => ({
        type: item.type === 'workflow' ? ('WORKFLOW' as const) : ('MINI_PROMPT' as const),
        id: item.id,
      }));
  };

  // Context menu actions
  const handleContextAddToFolder = useCallback(
    async (folderId: string, items: ContextMenuItem[]) => {
      const mappedItems = mapContextItemsToFolderItems(items);
      if (mappedItems.length === 0) return;

      const result = await addToFolderAction(folderId, mappedItems);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to add items to folder');
      }
    },
    [refreshData]
  );

  const handleContextMoveToFolder = useCallback(
    async (folderId: string, items: ContextMenuItem[]) => {
      const mappedItems = mapContextItemsToFolderItems(items);
      if (mappedItems.length === 0) return;

      const result = await moveToFolderAction(
        folderId,
        mappedItems,
        navigation.currentFolderId || undefined
      );
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to move items');
      }
    },
    [refreshData, navigation.currentFolderId]
  );

  const handleContextRemoveFromFolder = useCallback(
    async (items: ContextMenuItem[]) => {
      if (!navigation.currentFolderId) return;

      const mappedItems = mapContextItemsToFolderItems(items);
      if (mappedItems.length === 0) return;

      const result = await removeFromFolderAction(navigation.currentFolderId, mappedItems);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to remove items');
      }
    },
    [refreshData, navigation.currentFolderId]
  );

  const handleContextMoveToTrash = useCallback(
    async (items: ContextMenuItem[]) => {
      const mappedItems = items.map((item) => ({
        type:
          item.type === 'folder'
            ? ('FOLDER' as const)
            : item.type === 'workflow'
              ? ('WORKFLOW' as const)
              : ('MINI_PROMPT' as const),
        id: item.id,
      }));

      if (!confirm(`Move ${mappedItems.length} item(s) to trash?`)) return;

      const result = await bulkMoveToTrashAction(mappedItems);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to move items to trash');
      }
    },
    [refreshData]
  );

  // Trash actions
  const handleRestoreItem = useCallback(
    async (type: TrashedItem['type'], id: string) => {
      const result = await restoreItemAction(type, id);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to restore item');
      }
    },
    [refreshData]
  );

  const handlePermanentDelete = useCallback(
    async (type: TrashedItem['type'], id: string) => {
      if (!confirm('Permanently delete this item? This cannot be undone.')) return;

      const result = await permanentDeleteAction(type, id);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to delete item');
      }
    },
    [refreshData]
  );

  const handleRestoreSelected = useCallback(
    async (items: TrashedItem[]) => {
      const mappedItems = items.map((item) => ({
        type: item.type,
        id: item.id,
      }));

      const result = await bulkRestoreAction(mappedItems);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to restore items');
      }
    },
    [refreshData]
  );

  const handleDeleteSelectedPermanently = useCallback(
    async (items: TrashedItem[]) => {
      if (!confirm(`Permanently delete ${items.length} item(s)? This cannot be undone.`)) return;

      const mappedItems = items.map((item) => ({
        type: item.type,
        id: item.id,
      }));

      const result = await bulkPermanentDeleteAction(mappedItems);
      if (result.success) {
        await refreshData();
      } else {
        alert(result.error || 'Failed to delete items');
      }
    },
    [refreshData]
  );

  const handleEmptyTrash = useCallback(async () => {
    if (!confirm('Permanently delete all items in trash? This cannot be undone.')) return;

    const result = await emptyTrashAction();
    if (result.success) {
      await refreshData();
    } else {
      alert(result.error || 'Failed to empty trash');
    }
  }, [refreshData]);

  // Tab content
  const myLibraryContent = (
    <LibraryLayout
      sidebar={{
        folders,
        currentFolderId: navigation.currentFolderId,
        currentView: navigation.view,
        uncategorizedCount,
        trashCount,
        onFolderClick: navigation.navigateToFolder,
        onUncategorizedClick: navigation.navigateToUncategorized,
        onTrashClick: navigation.navigateToTrash,
        onRootClick: navigation.navigateToRoot,
        onCreateFolder: handleCreateFolder,
        onRenameFolder: handleRenameFolder,
        onDeleteFolder: handleDeleteFolder,
      }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={breadcrumbs}
        onNavigate={handleBreadcrumbNavigate}
        className="mb-4"
      />

      {/* Header */}
      <LibraryHeader
        searchQuery={navigation.searchQuery}
        onSearchChange={navigation.setSearchQuery}
        onCreateFolder={handleCreateFolder}
        onCreateWorkflow={handleCreateWorkflow}
        onCreatePrompt={handleCreatePrompt}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selection.selectedCount}
      />

      {/* Uncategorized prompt (only in uncategorized or root view) */}
      {(navigation.view === 'uncategorized' || navigation.view === 'root') && (
        <UncategorizedPromptState
          itemCount={uncategorizedCount}
          onCreateFolder={handleCreateFolder}
        />
      )}

      {/* Content - Trash View or Regular View */}
      {navigation.view === 'trash' ? (
        <TrashView
          items={trashedItems}
          isLoading={isLoading}
          onRestore={handleRestoreItem}
          onDeletePermanently={handlePermanentDelete}
          onRestoreSelected={handleRestoreSelected}
          onDeleteSelectedPermanently={handleDeleteSelectedPermanently}
          onEmptyTrash={handleEmptyTrash}
        />
      ) : (
        <FolderContentsView
          view={navigation.view}
          viewMode={viewMode}
          folders={navigation.view === 'root' ? folders : []}
          workflows={currentViewData.workflows}
          prompts={currentViewData.prompts}
          searchQuery={navigation.searchQuery}
          selectedIds={selection.selectedIds}
          onSelectItem={handleSelectItem}
          onOpenFolder={navigation.navigateToFolder}
          onOpenWorkflow={handleOpenWorkflow}
          onOpenPrompt={handleOpenPrompt}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateFolder={handleCreateFolder}
          onCreateWorkflow={handleCreateWorkflow}
          isLoading={isLoading}
        />
      )}

      {/* Selection Toolbar */}
      {navigation.view !== 'trash' && (
        <SelectionToolbar
          selectedCount={selection.selectedCount}
          folders={folders}
          currentFolderId={navigation.currentFolderId}
          isInFolderView={navigation.view === 'folder'}
          hasFoldersSelected={selection.getSelectedItems().some((item) => item.type === 'folder')}
          onAddToFolder={handleAddToFolder}
          onMoveToFolder={handleMoveToFolder}
          onRemoveFromFolder={handleRemoveFromFolder}
          onMoveToTrash={handleBulkDelete}
          onCreateFolder={handleCreateFolder}
          onClearSelection={selection.clearSelection}
        />
      )}

      {/* Context Menu */}
      <ItemContextMenu
        position={contextMenu.position}
        items={contextMenu.items}
        folders={folders}
        currentFolderId={navigation.currentFolderId}
        isInFolderView={navigation.view === 'folder'}
        onClose={closeContextMenu}
        onOpen={(id) => {
          const item = contextMenu.items[0];
          if (item?.type === 'folder') {
            navigation.navigateToFolder(id);
          } else if (item?.type === 'workflow') {
            handleOpenWorkflow(id);
          } else {
            handleOpenPrompt(id);
          }
          closeContextMenu();
        }}
        onRename={(id) => {
          handleRenameFolder(id);
          closeContextMenu();
        }}
        onAddToFolder={handleContextAddToFolder}
        onMoveToFolder={handleContextMoveToFolder}
        onRemoveFromFolder={handleContextRemoveFromFolder}
        onMoveToTrash={handleContextMoveToTrash}
        onCreateFolder={handleCreateFolder}
      />
    </LibraryLayout>
  );

  // Discover tab state
  const [discoverSearchQuery, setDiscoverSearchQuery] = useState('');

  // Import handlers for Discover tab
  const handleImportWorkflow = useCallback(async (workflowId: string) => {
    const result = await importWorkflowAction(workflowId);
    if (result.success) {
      // Optionally refresh library data after import
      await refreshData();
    } else {
      alert(result.error || 'Failed to import workflow');
    }
  }, [refreshData]);

  const handleImportPrompt = useCallback(async (promptId: string) => {
    const result = await importPromptAction(promptId);
    if (result.success) {
      // Optionally refresh library data after import
      await refreshData();
    } else {
      alert(result.error || 'Failed to import prompt');
    }
  }, [refreshData]);

  // Discover tab content with full DiscoverView - Cyberpunk Style
  const discoverContent = (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Search - Cyberpunk Style */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="SCAN_PUBLIC_DATABASE..."
            value={discoverSearchQuery}
            onChange={(e) => setDiscoverSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-[#0a0a0f]/80 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-500/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Discover View */}
      <DiscoverView
        searchQuery={discoverSearchQuery}
        onImportWorkflow={handleImportWorkflow}
        onImportPrompt={handleImportPrompt}
      />
    </div>
  );

  return (
    <div className="h-full">
      <Tabs
        defaultTab={navigation.tab}
        tabs={[
          {
            id: 'my-library',
            label: t('title'),
            content: myLibraryContent,
          },
          {
            id: 'discover',
            label: tNav('discover'),
            content: discoverContent,
          },
        ]}
      />

      {/* Prompt Preview Modal */}
      <PromptPreviewModal
        prompt={previewPrompt}
        onClose={handleClosePromptPreview}
      />
    </div>
  );
}
