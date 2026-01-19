import { renderHook, act } from '@testing-library/react';
import { useLibrarySearch, useMultiListSearch, SearchableItem } from '../useLibrarySearch';

describe('useLibrarySearch Hook', () => {
  const mockItems: SearchableItem[] = [
    { id: '1', name: 'React Tutorial', description: 'Learn React basics' },
    { id: '2', name: 'Vue Guide', description: 'Vue.js fundamentals' },
    { id: '3', name: 'Angular Basics', description: 'Getting started with Angular' },
    { id: '4', name: 'React Advanced', description: 'Advanced React patterns' },
    { id: '5', name: 'TypeScript Intro', description: null },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should return all items when query is empty', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      expect(result.current.query).toBe('');
      expect(result.current.filteredItems).toEqual(mockItems);
      expect(result.current.isActive).toBe(false);
      expect(result.current.hasResults).toBe(true);
    });

    it('should not be searching initially', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('setQuery', () => {
    it('should update query immediately', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('React');
      });

      expect(result.current.query).toBe('React');
    });

    it('should set isActive when query is not empty', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('test');
      });

      expect(result.current.isActive).toBe(true);
    });

    it('should set isSearching true during debounce', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('React');
      });

      // Query changed but debounced query hasn't yet
      expect(result.current.isSearching).toBe(true);
    });
  });

  describe('debouncing', () => {
    it('should debounce search query by default (300ms)', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('React');
      });

      // Before debounce completes
      expect(result.current.debouncedQuery).toBe('');
      expect(result.current.filteredItems).toEqual(mockItems);

      // Fast-forward past debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('React');
      expect(result.current.isSearching).toBe(false);
    });

    it('should respect custom debounce time', async () => {
      const { result } = renderHook(() =>
        useLibrarySearch(mockItems, { debounceMs: 500 })
      );

      act(() => {
        result.current.setQuery('React');
      });

      // At 300ms - should not have debounced yet
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedQuery).toBe('');

      // At 500ms - should be debounced
      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(result.current.debouncedQuery).toBe('React');
    });

    it('should reset timer on rapid typing', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('R');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        result.current.setQuery('Re');
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        result.current.setQuery('Rea');
      });

      // Still debouncing
      expect(result.current.debouncedQuery).toBe('');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Now debounced to final value
      expect(result.current.debouncedQuery).toBe('Rea');
    });
  });

  describe('filtering', () => {
    it('should filter items by name (case-insensitive)', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('react');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filteredItems.map((i) => i.id)).toEqual(['1', '4']);
    });

    it('should filter items by description when enabled', async () => {
      const { result } = renderHook(() =>
        useLibrarySearch(mockItems, { searchDescriptions: true })
      );

      act(() => {
        result.current.setQuery('patterns');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].id).toBe('4');
    });

    it('should not filter by description when disabled', async () => {
      const { result } = renderHook(() =>
        useLibrarySearch(mockItems, { searchDescriptions: false })
      );

      act(() => {
        result.current.setQuery('patterns');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toHaveLength(0);
    });

    it('should handle items with null description', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('TypeScript');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].id).toBe('5');
    });

    it('should trim search query', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('  React  ');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toHaveLength(2);
    });

    it('should return all items for whitespace-only query', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('   ');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toEqual(mockItems);
    });
  });

  describe('hasResults', () => {
    it('should be true when items match', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('React');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.hasResults).toBe(true);
    });

    it('should be false when no items match', async () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('xyz123');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.hasResults).toBe(false);
    });
  });

  describe('clearSearch', () => {
    it('should clear query and debouncedQuery', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('React');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.query).toBe('React');
      expect(result.current.debouncedQuery).toBe('React');

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.query).toBe('');
      expect(result.current.debouncedQuery).toBe('');
      expect(result.current.filteredItems).toEqual(mockItems);
    });

    it('should set isActive to false', () => {
      const { result } = renderHook(() => useLibrarySearch(mockItems));

      act(() => {
        result.current.setQuery('test');
      });

      expect(result.current.isActive).toBe(true);

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('empty items', () => {
    it('should handle empty items array', () => {
      const { result } = renderHook(() => useLibrarySearch([]));

      expect(result.current.filteredItems).toEqual([]);
      expect(result.current.hasResults).toBe(false);

      act(() => {
        result.current.setQuery('test');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.filteredItems).toEqual([]);
    });
  });
});

describe('useMultiListSearch Hook', () => {
  const folders: SearchableItem[] = [
    { id: 'f1', name: 'My Projects', description: 'Work projects' },
    { id: 'f2', name: 'Personal', description: 'Personal stuff' },
  ];

  const workflows: SearchableItem[] = [
    { id: 'w1', name: 'Project Setup', description: 'Initialize projects' },
    { id: 'w2', name: 'Code Review', description: 'Review process' },
  ];

  const prompts: SearchableItem[] = [
    { id: 'p1', name: 'Debug Helper', description: 'Debug code issues' },
    { id: 'p2', name: 'Project Planner', description: 'Plan new projects' },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should return filterItems function', () => {
      const { result } = renderHook(() => useMultiListSearch());

      expect(typeof result.current.filterItems).toBe('function');
    });

    it('should not filter when query is empty', () => {
      const { result } = renderHook(() => useMultiListSearch());

      const filteredFolders = result.current.filterItems(folders);
      const filteredWorkflows = result.current.filterItems(workflows);
      const filteredPrompts = result.current.filterItems(prompts);

      expect(filteredFolders).toEqual(folders);
      expect(filteredWorkflows).toEqual(workflows);
      expect(filteredPrompts).toEqual(prompts);
    });
  });

  describe('filterItems', () => {
    it('should filter multiple lists with same query', async () => {
      const { result } = renderHook(() => useMultiListSearch());

      act(() => {
        result.current.setQuery('Project');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      const filteredFolders = result.current.filterItems(folders);
      const filteredWorkflows = result.current.filterItems(workflows);
      const filteredPrompts = result.current.filterItems(prompts);

      // "Project" should match:
      // - f1 (My Projects)
      // - w1 (Project Setup)
      // - p2 (Project Planner)
      expect(filteredFolders).toHaveLength(1);
      expect(filteredFolders[0].id).toBe('f1');

      expect(filteredWorkflows).toHaveLength(1);
      expect(filteredWorkflows[0].id).toBe('w1');

      expect(filteredPrompts).toHaveLength(1);
      expect(filteredPrompts[0].id).toBe('p2');
    });

    it('should search descriptions by default', async () => {
      const { result } = renderHook(() => useMultiListSearch());

      act(() => {
        result.current.setQuery('process');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      const filteredWorkflows = result.current.filterItems(workflows);

      expect(filteredWorkflows).toHaveLength(1);
      expect(filteredWorkflows[0].id).toBe('w2');
    });

    it('should not search descriptions when disabled', async () => {
      const { result } = renderHook(() =>
        useMultiListSearch({ searchDescriptions: false })
      );

      act(() => {
        result.current.setQuery('process');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      const filteredWorkflows = result.current.filterItems(workflows);

      expect(filteredWorkflows).toHaveLength(0);
    });
  });

  describe('clearSearch', () => {
    it('should return all items after clearing', async () => {
      const { result } = renderHook(() => useMultiListSearch());

      act(() => {
        result.current.setQuery('xyz');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // No matches
      expect(result.current.filterItems(folders)).toHaveLength(0);

      act(() => {
        result.current.clearSearch();
      });

      // All items back
      expect(result.current.filterItems(folders)).toEqual(folders);
    });
  });

  describe('isSearching and isActive', () => {
    it('should track searching state', () => {
      const { result } = renderHook(() => useMultiListSearch());

      expect(result.current.isSearching).toBe(false);
      expect(result.current.isActive).toBe(false);

      act(() => {
        result.current.setQuery('test');
      });

      expect(result.current.isSearching).toBe(true);
      expect(result.current.isActive).toBe(true);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isSearching).toBe(false);
      expect(result.current.isActive).toBe(true);
    });
  });
});
