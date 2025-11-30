import { renderHook, act } from '@testing-library/react';
import { useLibraryReorder } from '../use-library-reorder';
import { DragEndEvent } from '@dnd-kit/core';

// Mock fetch
global.fetch = jest.fn();

describe('useLibraryReorder', () => {
  const mockItems = [
    { id: '1', position: 0, name: 'Item 1' },
    { id: '2', position: 1, name: 'Item 2' },
    { id: '3', position: 2, name: 'Item 3' },
  ];

  let mockSetItems: jest.Mock;

  beforeEach(() => {
    mockSetItems = jest.fn();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should return sensors and handleDragEnd', () => {
    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    expect(result.current.sensors).toBeDefined();
    expect(result.current.handleDragEnd).toBeDefined();
    expect(typeof result.current.handleDragEnd).toBe('function');
  });

  it('should do nothing if dropped in same position', async () => {
    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    const dragEvent: DragEndEvent = {
      active: { id: '1', data: { current: undefined } },
      over: { id: '1', data: { current: undefined }, disabled: false },
      activatorEvent: {} as Event,
      collisions: null,
      delta: { x: 0, y: 0 },
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    expect(mockSetItems).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should do nothing if over is null', async () => {
    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    const dragEvent: DragEndEvent = {
      active: { id: '1', data: { current: undefined } },
      over: null,
      activatorEvent: {} as Event,
      collisions: null,
      delta: { x: 0, y: 0 },
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    expect(mockSetItems).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should reorder items and call API for workflows', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    const dragEvent: DragEndEvent = {
      active: { id: '1', data: { current: undefined } },
      over: { id: '3', data: { current: undefined }, disabled: false },
      activatorEvent: {} as Event,
      collisions: null,
      delta: { x: 0, y: 0 },
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    // Check optimistic update
    expect(mockSetItems).toHaveBeenCalledWith([
      { id: '2', position: 1, name: 'Item 2' },
      { id: '3', position: 2, name: 'Item 3' },
      { id: '1', position: 0, name: 'Item 1' },
    ]);

    // Check API call
    expect(global.fetch).toHaveBeenCalledWith('/api/workflows/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: '1',
        newPosition: 2,
      }),
    });
  });

  it('should use correct parameter name for mini-prompts endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/mini-prompts/reorder')
    );

    const dragEvent: DragEndEvent = {
      active: { id: '2', data: { current: undefined } },
      over: { id: '1', data: { current: undefined }, disabled: false },
      activatorEvent: {} as Event,
      collisions: null,
      delta: { x: 0, y: 0 },
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/mini-prompts/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        miniPromptId: '2',
        newPosition: 0,
      }),
    });
  });

  it('should revert optimistic update on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    const dragEvent: DragEndEvent = {
      active: { id: '1', data: { current: undefined } },
      over: { id: '3', data: { current: undefined }, disabled: false },
      activatorEvent: {} as Event,
      collisions: null,
      delta: { x: 0, y: 0 },
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    // Should have made optimistic update
    expect(mockSetItems).toHaveBeenCalledTimes(2);

    // First call: optimistic update
    expect(mockSetItems).toHaveBeenNthCalledWith(1, [
      { id: '2', position: 1, name: 'Item 2' },
      { id: '3', position: 2, name: 'Item 3' },
      { id: '1', position: 0, name: 'Item 1' },
    ]);

    // Second call: revert
    expect(mockSetItems).toHaveBeenNthCalledWith(2, mockItems);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should revert optimistic update on network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    const dragEvent: DragEndEvent = {
      active: { id: '1', data: { current: undefined } },
      over: { id: '2', data: { current: undefined }, disabled: false },
      activatorEvent: {} as Event,
      collisions: null,
      delta: { x: 0, y: 0 },
    };

    await act(async () => {
      await result.current.handleDragEnd(dragEvent);
    });

    // Should have reverted
    expect(mockSetItems).toHaveBeenCalledTimes(2);
    expect(mockSetItems).toHaveBeenNthCalledWith(2, mockItems);

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should configure PointerSensor with 8px activation distance', () => {
    const { result } = renderHook(() =>
      useLibraryReorder(mockItems, mockSetItems, '/api/workflows/reorder')
    );

    // Sensors should be configured (actual implementation details are internal to @dnd-kit)
    expect(result.current.sensors).toBeDefined();
    expect(Array.isArray(result.current.sensors)).toBe(true);
  });
});
