'use client';

import { useState, useEffect, useCallback } from 'react';

interface OpenAIKeyStatus {
  hasKey: boolean;
  updatedAt: Date | null;
}

interface UseOpenAIKeyReturn {
  hasKey: boolean;
  updatedAt: Date | null;
  isLoading: boolean;
  error: string | null;
  saveKey: (apiKey: string, testConnection?: boolean) => Promise<void>;
  removeKey: () => Promise<void>;
  testKey: (apiKey: string) => Promise<{ valid: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing user's OpenAI API key
 *
 * @returns OpenAI key status and management functions
 */
export function useOpenAIKey(): UseOpenAIKeyReturn {
  const [hasKey, setHasKey] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current key status
  const fetchKeyStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai-assistant/openai-key');

      if (!response.ok) {
        throw new Error('Failed to fetch OpenAI key status');
      }

      const data: OpenAIKeyStatus = await response.json();

      setHasKey(data.hasKey);
      setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching OpenAI key status:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load key status on mount
  useEffect(() => {
    fetchKeyStatus();
  }, [fetchKeyStatus]);

  // Save API key
  const saveKey = useCallback(
    async (apiKey: string, testConnection = true) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/ai-assistant/openai-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey, testConnection }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to save API key');
        }

        setHasKey(true);
        setUpdatedAt(new Date(data.updatedAt));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        throw err; // Re-throw for component handling
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Remove API key
  const removeKey = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai-assistant/openai-key', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove API key');
      }

      setHasKey(false);
      setUpdatedAt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test API key without saving
  const testKey = useCallback(
    async (apiKey: string): Promise<{ valid: boolean; error?: string }> => {
      try {
        const response = await fetch('/api/ai-assistant/openai-key/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        });

        if (!response.ok) {
          return {
            valid: false,
            error: 'Failed to test API key',
          };
        }

        const data = await response.json();
        return {
          valid: data.valid,
          error: data.error,
        };
      } catch (err) {
        return {
          valid: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    },
    []
  );

  return {
    hasKey,
    updatedAt,
    isLoading,
    error,
    saveKey,
    removeKey,
    testKey,
    refresh: fetchKeyStatus,
  };
}
