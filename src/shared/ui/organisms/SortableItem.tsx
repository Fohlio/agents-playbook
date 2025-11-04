'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface SortableItemProps {
  id: string;
  children: ReactNode;
}

/**
 * SortableItem Component
 *
 * Wrapper component that makes any child draggable and sortable
 * Uses @dnd-kit/sortable for drag-and-drop functionality
 *
 * FSD Layer: Organisms
 * External Dependencies: @dnd-kit/sortable, @dnd-kit/utilities
 */
export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="h-full"
      data-testid={`sortable-item-${id}`}
    >
      {children}
    </div>
  );
}
