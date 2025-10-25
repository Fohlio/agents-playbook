"use client";

import { ReactNode } from "react";

interface DiscoveryGridProps<T> {
  items: T[];
  renderCard: (item: T) => ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}

export function DiscoveryGrid<T>({
  items,
  renderCard,
  loading,
  emptyMessage = "No items found",
}: DiscoveryGridProps<T>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 rounded-lg animate-pulse"
            data-testid="skeleton-card"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="discovery-grid"
    >
      {items.map((item) => renderCard(item))}
    </div>
  );
}
