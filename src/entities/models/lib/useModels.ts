'use client';

import { useState, useEffect } from 'react';
import { fetchModels } from '../api';
import { Model, ModelsByCategory } from '../model/types';

interface UseModelsReturn {
  models: Model[];
  byCategory: ModelsByCategory;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage AI models data
 * 
 * Provides models list with loading and error states.
 * Caches the result in component state.
 */
export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<Model[]>([]);
  const [byCategory, setByCategory] = useState<ModelsByCategory>({ LLM: [], IMAGE: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchModels()
      .then((data) => {
        if (mounted) {
          setModels(data.models || []);
          setByCategory(data.byCategory || { LLM: [], IMAGE: [] });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { models, byCategory, loading, error };
}

