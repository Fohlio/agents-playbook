import { DragEndEvent, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * useLibraryReorder Hook
 *
 * Custom hook for handling drag-and-drop reordering in the Library
 * Provides sensors configuration and drag end handler with optimistic updates
 *
 * @param items - Array of items with id and position
 * @param setItems - State setter for items
 * @param apiEndpoint - API endpoint for persisting reorder (/api/workflows/reorder or /api/mini-prompts/reorder)
 * @returns sensors and handleDragEnd for DndContext
 */
export function useLibraryReorder<T extends { id: string; position: number }>(
  items: T[],
  setItems: (items: T[]) => void,
  apiEndpoint: string
) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px drag distance before activating
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // No-op if dropped in same position or outside droppable area
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    // Reorder array using arrayMove utility
    const reordered = arrayMove(items, oldIndex, newIndex);

    // Optimistic UI update
    setItems(reordered);

    try {
      // Determine parameter name based on endpoint
      const paramName = apiEndpoint.includes('workflows') ? 'workflowId' : 'miniPromptId';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [paramName]: active.id,
          newPosition: newIndex
        })
      });

      if (!response.ok) {
        throw new Error('Reorder failed');
      }
    } catch (error) {
      console.error('Failed to reorder:', error);
      // Revert optimistic update on error
      setItems(items);
    }
  };

  return { sensors, handleDragEnd };
}
