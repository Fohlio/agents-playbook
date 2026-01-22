'use client';

import { useTranslations } from 'next-intl';
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
 * Breadcrumbs Component - Cyberpunk Style
 *
 * Terminal-style navigation path: ROOT > FOLDER > SUBFOLDER
 */
export function Breadcrumbs({ items, onNavigate, className }: BreadcrumbsProps) {
  const t = useTranslations('breadcrumbs');

  if (items.length === 0) {
    return null;
  }

  const getLabel = (item: BreadcrumbItem) => {
    switch (item.type) {
      case 'home':
        return t('myLibrary');
      case 'trash':
        return t('trash');
      case 'uncategorized':
        return t('uncategorized');
      default:
        return item.label;
    }
  };

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
      className={cn('flex items-center gap-1 text-sm font-mono', className)}
      data-testid="breadcrumbs"
    >
      <span className="text-cyan-500/50 mr-1">&gt;</span>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-cyan-500/40 flex-shrink-0" />
            )}
            <button
              onClick={() => onNavigate(item)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 uppercase tracking-wider transition-all',
                isLast
                  ? 'text-cyan-400 cursor-default'
                  : 'text-cyan-100/50 hover:text-cyan-400 hover:bg-cyan-500/10'
              )}
              disabled={isLast}
              data-testid={`breadcrumb-${item.type}`}
            >
              {getIcon(item.type)}
              <span className="max-w-[200px] truncate">{getLabel(item)}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
