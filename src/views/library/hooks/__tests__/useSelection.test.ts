import { renderHook, act } from '@testing-library/react';
import { useSelection, SelectableItem } from '../useSelection';

describe('useSelection Hook', () => {
  const mockItems: SelectableItem[] = [
    { id: 'item-1', type: 'folder' },
    { id: 'item-2', type: 'workflow' },
    { id: 'item-3', type: 'workflow' },
    { id: 'item-4', type: 'prompt' },
    { id: 'item-5', type: 'prompt' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('select', () => {
    it('should select a single item and clear previous selections', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.select('item-1');
      });

      expect(result.current.selectedIds.has('item-1')).toBe(true);
      expect(result.current.selectedCount).toBe(1);

      // Select another item - should clear previous
      act(() => {
        result.current.select('item-2');
      });

      expect(result.current.selectedIds.has('item-1')).toBe(false);
      expect(result.current.selectedIds.has('item-2')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('should update isSelected correctly', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      expect(result.current.isSelected('item-1')).toBe(false);

      act(() => {
        result.current.select('item-1');
      });

      expect(result.current.isSelected('item-1')).toBe(true);
      expect(result.current.isSelected('item-2')).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should add item to selection when not selected', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.toggle('item-1');
      });

      expect(result.current.selectedIds.has('item-1')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('should remove item from selection when already selected', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.select('item-1');
      });

      expect(result.current.selectedIds.has('item-1')).toBe(true);

      act(() => {
        result.current.toggle('item-1');
      });

      expect(result.current.selectedIds.has('item-1')).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });

    it('should allow multiple selections', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.toggle('item-1');
        result.current.toggle('item-2');
        result.current.toggle('item-3');
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('item-1')).toBe(true);
      expect(result.current.isSelected('item-2')).toBe(true);
      expect(result.current.isSelected('item-3')).toBe(true);
    });
  });

  describe('rangeSelect', () => {
    it('should select range of items between last selected and current', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      // First select an item
      act(() => {
        result.current.select('item-2');
      });

      // Then range select to item-4
      act(() => {
        result.current.rangeSelect('item-4');
      });

      expect(result.current.selectedIds.has('item-2')).toBe(true);
      expect(result.current.selectedIds.has('item-3')).toBe(true);
      expect(result.current.selectedIds.has('item-4')).toBe(true);
      expect(result.current.selectedCount).toBe(3);
    });

    it('should work in reverse direction', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      // First select an item
      act(() => {
        result.current.select('item-4');
      });

      // Then range select to item-2 (backwards)
      act(() => {
        result.current.rangeSelect('item-2');
      });

      expect(result.current.selectedIds.has('item-2')).toBe(true);
      expect(result.current.selectedIds.has('item-3')).toBe(true);
      expect(result.current.selectedIds.has('item-4')).toBe(true);
      expect(result.current.selectedCount).toBe(3);
    });

    it('should fall back to select if no previous selection', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.rangeSelect('item-3');
      });

      expect(result.current.selectedIds.has('item-3')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('should add to existing selection', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      // Select item-1
      act(() => {
        result.current.select('item-1');
      });

      // Select item-3
      act(() => {
        result.current.select('item-3');
      });

      // Range select to item-5
      act(() => {
        result.current.rangeSelect('item-5');
      });

      expect(result.current.selectedIds.has('item-3')).toBe(true);
      expect(result.current.selectedIds.has('item-4')).toBe(true);
      expect(result.current.selectedIds.has('item-5')).toBe(true);
    });
  });

  describe('selectAll', () => {
    it('should select all items', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(5);
      mockItems.forEach((item) => {
        expect(result.current.isSelected(item.id)).toBe(true);
      });
    });

    it('should work with empty items', () => {
      const { result } = renderHook(() => useSelection([]));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(5);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedCount).toBe(0);
      mockItems.forEach((item) => {
        expect(result.current.isSelected(item.id)).toBe(false);
      });
    });

    it('should reset lastSelectedId', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      // Select something
      act(() => {
        result.current.select('item-2');
      });

      // Clear
      act(() => {
        result.current.clearSelection();
      });

      // Range select should now fall back to select
      act(() => {
        result.current.rangeSelect('item-4');
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('item-4')).toBe(true);
    });
  });

  describe('getSelectedItems', () => {
    it('should return selected items with their types', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.toggle('item-1');
        result.current.toggle('item-3');
      });

      const selected = result.current.getSelectedItems();

      expect(selected).toHaveLength(2);
      expect(selected).toContainEqual({ id: 'item-1', type: 'folder' });
      expect(selected).toContainEqual({ id: 'item-3', type: 'workflow' });
    });

    it('should return empty array when nothing selected', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      const selected = result.current.getSelectedItems();

      expect(selected).toEqual([]);
    });
  });

  describe('handleItemClick', () => {
    it('should call select on normal click', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      const mockEvent = {
        shiftKey: false,
        metaKey: false,
        ctrlKey: false,
      } as React.MouseEvent;

      act(() => {
        result.current.handleItemClick('item-2', mockEvent);
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('item-2')).toBe(true);
    });

    it('should call toggle on Ctrl+click', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      // First select item-1
      act(() => {
        result.current.select('item-1');
      });

      const mockEvent = {
        shiftKey: false,
        metaKey: false,
        ctrlKey: true,
      } as React.MouseEvent;

      act(() => {
        result.current.handleItemClick('item-2', mockEvent);
      });

      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isSelected('item-1')).toBe(true);
      expect(result.current.isSelected('item-2')).toBe(true);
    });

    it('should call toggle on Cmd+click (metaKey)', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.select('item-1');
      });

      const mockEvent = {
        shiftKey: false,
        metaKey: true,
        ctrlKey: false,
      } as React.MouseEvent;

      act(() => {
        result.current.handleItemClick('item-2', mockEvent);
      });

      expect(result.current.selectedCount).toBe(2);
    });

    it('should call rangeSelect on Shift+click', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      // First select item-1
      act(() => {
        result.current.select('item-1');
      });

      const mockEvent = {
        shiftKey: true,
        metaKey: false,
        ctrlKey: false,
      } as React.MouseEvent;

      act(() => {
        result.current.handleItemClick('item-3', mockEvent);
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('item-1')).toBe(true);
      expect(result.current.isSelected('item-2')).toBe(true);
      expect(result.current.isSelected('item-3')).toBe(true);
    });
  });

  describe('keyboard shortcuts', () => {
    const dispatchKeyEvent = (key: string, modifiers: Partial<KeyboardEvent> = {}) => {
      const event = new KeyboardEvent('keydown', {
        key,
        ...modifiers,
        bubbles: true,
      });
      window.dispatchEvent(event);
    };

    it('should select all on Ctrl+A', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        dispatchKeyEvent('a', { ctrlKey: true });
      });

      expect(result.current.selectedCount).toBe(5);
    });

    it('should select all on Cmd+A', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        dispatchKeyEvent('a', { metaKey: true });
      });

      expect(result.current.selectedCount).toBe(5);
    });

    it('should clear selection on Escape', () => {
      const { result } = renderHook(() => useSelection(mockItems));

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(5);

      act(() => {
        dispatchKeyEvent('Escape');
      });

      expect(result.current.selectedCount).toBe(0);
    });

    it('should trigger delete callback on Delete key', () => {
      const onDeleteRequest = jest.fn();
      const { result } = renderHook(() => useSelection(mockItems, { onDeleteRequest }));

      act(() => {
        result.current.select('item-1');
      });

      act(() => {
        dispatchKeyEvent('Delete');
      });

      expect(onDeleteRequest).toHaveBeenCalled();
    });

    it('should trigger delete callback on Backspace key', () => {
      const onDeleteRequest = jest.fn();
      const { result } = renderHook(() => useSelection(mockItems, { onDeleteRequest }));

      act(() => {
        result.current.select('item-1');
      });

      act(() => {
        dispatchKeyEvent('Backspace');
      });

      expect(onDeleteRequest).toHaveBeenCalled();
    });

    it('should not trigger delete when nothing selected', () => {
      const onDeleteRequest = jest.fn();
      renderHook(() => useSelection(mockItems, { onDeleteRequest }));

      act(() => {
        dispatchKeyEvent('Delete');
      });

      expect(onDeleteRequest).not.toHaveBeenCalled();
    });
  });

  describe('items change behavior', () => {
    it('should clear selection when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useSelection(items),
        { initialProps: { items: mockItems } }
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(5);

      // Change items (different length)
      const newItems: SelectableItem[] = [
        { id: 'new-1', type: 'folder' },
        { id: 'new-2', type: 'workflow' },
      ];

      rerender({ items: newItems });

      expect(result.current.selectedCount).toBe(0);
    });
  });
});
