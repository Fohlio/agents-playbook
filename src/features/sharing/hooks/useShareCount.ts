"use client";

import { useState, useEffect, useCallback } from "react";

interface UseShareCountResult {
  count: number;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook to fetch and manage the count of active shared items.
 * Used in sidebar navigation to display badge.
 */
export function useShareCount(): UseShareCountResult {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/v1/share/my-items");
      if (!response.ok) {
        throw new Error("Failed to fetch shared items");
      }

      const data = await response.json();
      // Count only active shares
      const activeCount = (data.items || []).filter(
        (item: { isActive: boolean }) => item.isActive
      ).length;
      setCount(activeCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    count,
    loading,
    error,
    refresh: fetchCount,
  };
}

