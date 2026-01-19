'use client';

import { ChevronRight, Home, Folder, Trash2, Inbox } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';

export interface BreadcrumbItem {
  id: string;
  label: string;
  type: 'home' | 'folder' | 'trash' | 'uncategorized';
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
  className?: string;
}

/**
 * Breadcrumbs Component
 *
 * Displays navigation path in the Library.
 * Shows: Home > Folder Name or Home > Trash, etc.
 */
export function Breadcrumbs({ items, onNavigate, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  const getIcon = (type: BreadcrumbItem['type']) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'folder':
        return <Folder className="w-4 h-4" />;
      case 'trash':
        return <Trash2 className="w-4 h-4" />;
      case 'uncategorized':
        return <Inbox className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm', className)}
      data-testid="breadcrumbs"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            <button
              onClick={() => onNavigate(item)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors',
                isLast
                  ? 'text-gray-900 font-medium cursor-default'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
              disabled={isLast}
              data-testid={`breadcrumb-${item.type}`}
            >
              {getIcon(item.type)}
              <span className="max-w-[200px] truncate">{item.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
