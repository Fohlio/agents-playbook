'use client';

import { useState, useEffect, useCallback, useMemo, useRef, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState, EmptyStateIcons } from '@/shared/ui/molecules/EmptyState';
import { cn } from '@/shared/lib/utils/cn';
import { ROUTES } from '@/shared/routes';
import { PublicWorkflow, PublicPrompt } from '../services/discover-service';

interface DiscoverViewProps {
  searchQuery: string;
  onImportWorkflow: (workflowId: string) => Promise<void>;
  onImportPrompt: (promptId: string) => Promise<void>;
  className?: string;
}

interface DiscoverData {
  workflows: PublicWorkflow[];
  prompts: PublicPrompt[];
}

/**
 * DiscoverView Component
 *
 * Displays public workflows and prompts in a grid layout similar to FolderContentsView.
 * Features:
 * - Grid layout with cards for workflows and prompts
 * - Search functionality with 300ms debounce
 * - Context menu with Preview and Import to Library options
 * - Click on card shows preview/details
 */
export function DiscoverView({
  searchQuery,
  onImportWorkflow,
  onImportPrompt,
  className,
}: DiscoverViewProps) {
  const router = useRouter();
  const [data, setData] = useState<DiscoverData>({ workflows: [], prompts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: { id: string; type: 'workflow' | 'prompt'; name: string } | null;
  }>({ x: 0, y: 0, item: null });

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch discover data
  const fetchData = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/discover?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public content');
      }

      const result = await response.json();
      setData({
        workflows: result.workflows || [],
        prompts: result.prompts || [],
      });
    } catch (err) {
      console.error('Discover fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when search changes
  useEffect(() => {
    fetchData(debouncedSearch || undefined);
  }, [fetchData, debouncedSearch]);

  // Filter items based on search query (client-side filtering as backup)
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return data.workflows;
    const query = searchQuery.toLowerCase();
    return data.workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
    );
  }, [data.workflows, searchQuery]);

  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return data.prompts;
    const query = searchQuery.toLowerCase();
    return data.prompts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [data.prompts, searchQuery]);

  const isEmpty = filteredWorkflows.length === 0 && filteredPrompts.length === 0;
  const hasContent = data.workflows.length > 0 || data.prompts.length > 0;

  // Context menu handlers
  const handleContextMenu = useCallback(
    (e: MouseEvent, item: { id: string; type: 'workflow' | 'prompt'; name: string }) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, item });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, item: null });
  }, []);

  const handlePreview = useCallback(() => {
    if (!contextMenu.item) return;
    if (contextMenu.item.type === 'workflow') {
      router.push(ROUTES.LIBRARY.WORKFLOWS.EDIT(contextMenu.item.id));
    } else {
      router.push(ROUTES.LIBRARY.MINI_PROMPTS.EDIT(contextMenu.item.id));
    }
    closeContextMenu();
  }, [contextMenu.item, router, closeContextMenu]);

  const handleImport = useCallback(async () => {
    if (!contextMenu.item) return;
    try {
      if (contextMenu.item.type === 'workflow') {
        await onImportWorkflow(contextMenu.item.id);
      } else {
        await onImportPrompt(contextMenu.item.id);
      }
    } catch (err) {
      console.error('Import error:', err);
    }
    closeContextMenu();
  }, [contextMenu.item, onImportWorkflow, onImportPrompt, closeContextMenu]);

  // Open workflow/prompt handlers
  const handleOpenWorkflow = useCallback(
    (workflowId: string) => {
      router.push(ROUTES.LIBRARY.WORKFLOWS.EDIT(workflowId));
    },
    [router]
  );

  const handleOpenPrompt = useCallback(
    (promptId: string) => {
      router.push(ROUTES.LIBRARY.MINI_PROMPTS.EDIT(promptId));
    },
    [router]
  );

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.item) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.item, closeContextMenu]);

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-20', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title="Failed to load content"
        description={error}
        actions={[{ label: 'Try Again', onClick: () => fetchData(debouncedSearch || undefined) }]}
        className={className}
      />
    );
  }

  // Render empty state
  if (isEmpty) {
    // Search with no results
    if (searchQuery && hasContent) {
      return (
        <EmptyState
          icon={EmptyStateIcons.search}
          title="No results found"
          description={`No public items match "${searchQuery}". Try a different search term.`}
          className={className}
        />
      );
    }

    return (
      <EmptyState
        icon={EmptyStateIcons.library}
        title="No public content yet"
        description="There are no public workflows or prompts available at the moment. Check back later or create your own!"
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Workflows section */}
      {filteredWorkflows.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Public Workflows ({filteredWorkflows.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredWorkflows.map((workflow) => (
              <PublicWorkflowCard
                key={workflow.id}
                workflow={workflow}
                onOpen={() => handleOpenWorkflow(workflow.id)}
                onContextMenu={(e) =>
                  handleContextMenu(e, { id: workflow.id, type: 'workflow', name: workflow.name })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Prompts section */}
      {filteredPrompts.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Public Prompts ({filteredPrompts.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPrompts.map((prompt) => (
              <PublicPromptCard
                key={prompt.id}
                prompt={prompt}
                onOpen={() => handleOpenPrompt(prompt.id)}
                onContextMenu={(e) =>
                  handleContextMenu(e, { id: prompt.id, type: 'prompt', name: prompt.name })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Context Menu */}
      {contextMenu.item && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
          aria-label={`Actions for ${contextMenu.item.name}`}
        >
          <button
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 focus:outline-none focus:bg-gray-100 min-h-[44px]"
            onClick={handlePreview}
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview
          </button>
          <button
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 focus:outline-none focus:bg-gray-100 min-h-[44px]"
            onClick={handleImport}
            role="menuitem"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Import to Library
          </button>
        </div>
      )}
    </div>
  );
}

// Internal workflow card component for discover
interface PublicWorkflowCardProps {
  workflow: PublicWorkflow;
  onOpen: () => void;
  onContextMenu: (e: MouseEvent) => void;
}

function PublicWorkflowCard({ workflow, onOpen, onContextMenu }: PublicWorkflowCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-gray-300'
      )}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      data-testid={`discover-workflow-card-${workflow.id}`}
    >
      {/* Public badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Public
        </span>
      </div>

      {/* Workflow icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-purple-50 rounded-lg">
          <svg
            className="w-8 h-8 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
      </div>

      {/* Workflow name */}
      <h4 className="text-center font-medium text-gray-900 truncate">{workflow.name}</h4>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
        <span>{workflow.stageCount} stages</span>
        {workflow.authorName && (
          <>
            <span className="text-gray-300">|</span>
            <span>{workflow.authorName}</span>
          </>
        )}
      </div>

      {/* Description */}
      {workflow.description && (
        <p className="mt-2 text-xs text-gray-400 text-center line-clamp-2">
          {workflow.description}
        </p>
      )}
    </div>
  );
}

// Internal prompt card component for discover
interface PublicPromptCardProps {
  prompt: PublicPrompt;
  onOpen: () => void;
  onContextMenu: (e: MouseEvent) => void;
}

function PublicPromptCard({ prompt, onOpen, onContextMenu }: PublicPromptCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-lg border p-4 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-gray-300'
      )}
      onClick={onOpen}
      onContextMenu={onContextMenu}
      data-testid={`discover-prompt-card-${prompt.id}`}
    >
      {/* Public badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Public
        </span>
      </div>

      {/* Prompt icon */}
      <div className="flex justify-center mb-3 mt-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Prompt name */}
      <h4 className="text-center font-medium text-gray-900 truncate">{prompt.name}</h4>

      {/* Meta info */}
      {prompt.authorName && (
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
          <span>{prompt.authorName}</span>
        </div>
      )}

      {/* Description */}
      {prompt.description && (
        <p className="mt-2 text-xs text-gray-400 text-center line-clamp-2">
          {prompt.description}
        </p>
      )}
    </div>
  );
}

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
