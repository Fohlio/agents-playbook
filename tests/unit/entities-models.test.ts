import { renderHook, waitFor } from '@testing-library/react';
import { fetchModels } from '@/entities/models/api';
import { useModels } from '@/entities/models/lib/useModels';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

describe('entities/models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchModels', () => {
    it('should fetch models from API', async () => {
      const mockResponse = {
        models: [
          { id: '1', name: 'Claude', slug: 'claude', category: 'LLM' },
        ],
        byCategory: {
          LLM: [{ id: '1', name: 'Claude', slug: 'claude', category: 'LLM' }],
          IMAGE: [],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchModels();

      expect(mockFetch).toHaveBeenCalledWith('/api/models');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchModels()).rejects.toThrow('Failed to fetch models');
    });
  });

  describe('useModels hook', () => {
    const mockModelsResponse = {
      models: [
        { id: '1', name: 'Claude', slug: 'claude', category: 'LLM' },
        { id: '2', name: 'Midjourney', slug: 'midjourney', category: 'IMAGE' },
      ],
      byCategory: {
        LLM: [{ id: '1', name: 'Claude', slug: 'claude', category: 'LLM' }],
        IMAGE: [{ id: '2', name: 'Midjourney', slug: 'midjourney', category: 'IMAGE' }],
      },
    };

    it('should start with loading state', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolve

      const { result } = renderHook(() => useModels());

      expect(result.current.loading).toBe(true);
      expect(result.current.models).toEqual([]);
    });

    it('should fetch and return models', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.models).toHaveLength(2);
      expect(result.current.models[0].name).toBe('Claude');
    });

    it('should return models grouped by category', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.byCategory.LLM).toHaveLength(1);
      expect(result.current.byCategory.IMAGE).toHaveLength(1);
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Network error');
      mockFetch.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.models).toEqual([]);
    });

    it('should handle empty models response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ models: [], byCategory: { LLM: [], IMAGE: [] } }),
      });

      const { result } = renderHook(() => useModels());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.models).toEqual([]);
      expect(result.current.byCategory.LLM).toEqual([]);
      expect(result.current.byCategory.IMAGE).toEqual([]);
    });

    it('should cleanup on unmount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModelsResponse),
      });

      const { unmount } = renderHook(() => useModels());
      
      // Unmount before fetch completes - should not cause errors
      unmount();

      // No assertions needed - just ensure no errors are thrown
    });
  });
});

