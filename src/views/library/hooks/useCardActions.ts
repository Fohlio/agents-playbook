"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type CardItemType = 'workflow' | 'skill';

export interface CardItem {
  id: string;
  type: CardItemType;
  name: string;
  isActive: boolean;
  visibility: 'PUBLIC' | 'PRIVATE';
}

export interface UseCardActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseCardActionsReturn {
  // Loading states
  isDuplicating: boolean;
  isDeleting: boolean;
  isTogglingActive: boolean;
  isTogglingVisibility: boolean;

  // Actions
  duplicate: (item: CardItem) => Promise<void>;
  deleteItem: (item: CardItem) => Promise<void>;
  toggleActive: (item: CardItem, newValue: boolean) => Promise<void>;
  toggleVisibility: (item: CardItem, newValue: 'PUBLIC' | 'PRIVATE') => Promise<void>;

  // Share modal state
  shareModalItem: CardItem | null;
  openShareModal: (item: CardItem) => void;
  closeShareModal: () => void;
}

/**
 * useCardActions Hook
 *
 * Centralizes card action logic for workflows and skills:
 * - Duplicate
 * - Delete (soft delete)
 * - Toggle active status
 * - Toggle visibility (public/private)
 * - Share modal management
 */
export function useCardActions(
  options: UseCardActionsOptions = {}
): UseCardActionsReturn {
  const { onSuccess, onError } = options;
  const router = useRouter();

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [shareModalItem, setShareModalItem] = useState<CardItem | null>(null);

  const getApiEndpoint = (type: CardItemType, id: string) => {
    return type === 'workflow' ? `/api/workflows/${id}` : `/api/skills/${id}`;
  };

  /**
   * Generic async action handler that reduces boilerplate
   */
  const executeAction = useCallback(
    async (
      setLoading: (v: boolean) => void,
      action: () => Promise<Response>,
      errorPrefix: string
    ): Promise<void> => {
      setLoading(true);
      try {
        const response = await action();
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to ${errorPrefix}`);
        }
        onSuccess?.();
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : `Failed to ${errorPrefix}`;
        onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, router]
  );

  const duplicate = useCallback(
    (item: CardItem) => executeAction(
      setIsDuplicating,
      () => fetch(`${getApiEndpoint(item.type, item.id)}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
      'duplicate'
    ),
    [executeAction]
  );

  const deleteItem = useCallback(
    (item: CardItem) => executeAction(
      setIsDeleting,
      () => fetch(getApiEndpoint(item.type, item.id), { method: 'DELETE' }),
      'delete'
    ),
    [executeAction]
  );

  const toggleActive = useCallback(
    (item: CardItem, newValue: boolean) => executeAction(
      setIsTogglingActive,
      () => fetch(getApiEndpoint(item.type, item.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newValue }),
      }),
      'update'
    ),
    [executeAction]
  );

  const toggleVisibility = useCallback(
    (item: CardItem, newValue: 'PUBLIC' | 'PRIVATE') => executeAction(
      setIsTogglingVisibility,
      () => fetch(getApiEndpoint(item.type, item.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newValue }),
      }),
      'update'
    ),
    [executeAction]
  );

  const openShareModal = useCallback((item: CardItem) => {
    setShareModalItem(item);
  }, []);

  const closeShareModal = useCallback(() => {
    setShareModalItem(null);
  }, []);

  return {
    isDuplicating,
    isDeleting,
    isTogglingActive,
    isTogglingVisibility,
    duplicate,
    deleteItem,
    toggleActive,
    toggleVisibility,
    shareModalItem,
    openShareModal,
    closeShareModal,
  };
}
