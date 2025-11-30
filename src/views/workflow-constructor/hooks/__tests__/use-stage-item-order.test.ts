import { renderHook } from '@testing-library/react';
import { useStageItemOrder } from '../use-stage-item-order';
import type { WorkflowStageWithMiniPrompts } from '@/shared/lib/types/workflow-constructor-types';

describe('useStageItemOrder', () => {
  const createMockStage = (
    overrides?: Partial<WorkflowStageWithMiniPrompts>
  ): WorkflowStageWithMiniPrompts => ({
    id: 'stage-1',
    workflowId: 'workflow-1',
    name: 'Test Stage',
    description: null,
    color: '#64748b',
    order: 0,
    withReview: true,
    includeMultiAgentChat: false,
    createdAt: new Date(),
    miniPrompts: [
      {
        stageId: 'stage-1',
        miniPromptId: 'mp-1',
        order: 0,
        miniPrompt: {
          id: 'mp-1',
          userId: 'user-1',
          name: 'Mini Prompt 1',
          description: null,
          content: 'Content 1',
          visibility: 'PRIVATE' as const,
          isActive: true,
          isSystemMiniPrompt: false,
          isAutomatic: false,
          position: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
    ...overrides,
  } as WorkflowStageWithMiniPrompts);

  it('should build default order when itemOrder is not set', () => {
    const stage = createMockStage({
      itemOrder: undefined,
      withReview: true,
      includeMultiAgentChat: false,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: false })
    );

    expect(result.current.itemIds).toEqual(['mp-1', 'memory-board-stage-1']);
  });

  it('should include multi-agent chat in default order when enabled (one per stage)', () => {
    const stage = createMockStage({
      itemOrder: undefined,
      withReview: false,
      includeMultiAgentChat: true,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: true })
    );

    expect(result.current.itemIds).toEqual(['mp-1', 'multi-agent-chat-stage-1']);
  });

  it('should use stored itemOrder when available', () => {
    const stage = createMockStage({
      itemOrder: ['mp-1', 'memory-board-stage-1'],
      withReview: true,
      includeMultiAgentChat: false,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: false })
    );

    expect(result.current.itemIds).toEqual(['mp-1', 'memory-board-stage-1']);
  });

  it('should filter out items that no longer exist from stored order', () => {
    const stage = createMockStage({
      itemOrder: ['mp-1', 'non-existent-id', 'memory-board-stage-1'],
      withReview: true,
      includeMultiAgentChat: false,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: false })
    );

    expect(result.current.itemIds).toEqual(['mp-1', 'memory-board-stage-1']);
  });

  it('should add new mini-prompts to existing itemOrder without duplicates', () => {
    const stage = createMockStage({
      itemOrder: ['mp-1', 'memory-board-stage-1'],
      miniPrompts: [
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-1',
          order: 0,
          miniPrompt: {
            id: 'mp-1',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-2',
          order: 1,
          miniPrompt: {
            id: 'mp-2',
            userId: 'user-1',
            name: 'Mini Prompt 2',
            description: null,
            content: 'Content 2',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: true,
      includeMultiAgentChat: false,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: false })
    );

    // Should include mp-1 (already in order), mp-2 (new), and memory-board
    expect(result.current.itemIds).toContain('mp-1');
    expect(result.current.itemIds).toContain('mp-2');
    expect(result.current.itemIds).toContain('memory-board-stage-1');
    // Should not have duplicates
    expect(result.current.itemIds.filter(id => id === 'mp-1').length).toBe(1);
    expect(result.current.itemIds.filter(id => id === 'memory-board-stage-1').length).toBe(1);
  });

  it('should add multi-agent chat (one per stage) when enabled', () => {
    const stage = createMockStage({
      itemOrder: ['mp-1'],
      miniPrompts: [
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-1',
          order: 0,
          miniPrompt: {
            id: 'mp-1',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-2',
          order: 1,
          miniPrompt: {
            id: 'mp-2',
            userId: 'user-1',
            name: 'Mini Prompt 2',
            description: null,
            content: 'Content 2',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: false,
      includeMultiAgentChat: true,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: true })
    );

    // Should include mp-1 (already in order), mp-2 (new), and multi-agent-chat-stage-1 (one per stage)
    expect(result.current.itemIds).toContain('mp-1');
    expect(result.current.itemIds).toContain('mp-2');
    expect(result.current.itemIds).toContain('multi-agent-chat-stage-1');
    // Should only have one multi-agent chat (per stage, not per mini-prompt)
    expect(result.current.itemIds.filter((id): id is string => typeof id === 'string' && id.startsWith('multi-agent-chat-')).length).toBe(1);
    expect(result.current.itemIds.filter((id): id is string => typeof id === 'string' && id === 'multi-agent-chat-stage-1').length).toBe(1);
  });

  it('should not add auto-prompts that are already in itemOrder', () => {
    const stage = createMockStage({
      itemOrder: ['mp-1', 'mp-2', 'multi-agent-chat-stage-1'],
      miniPrompts: [
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-1',
          order: 0,
          miniPrompt: {
            id: 'mp-1',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-2',
          order: 1,
          miniPrompt: {
            id: 'mp-2',
            userId: 'user-1',
            name: 'Mini Prompt 2',
            description: null,
            content: 'Content 2',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: false,
      includeMultiAgentChat: true,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: true })
    );

    // Should use the existing order without adding duplicates
    expect(result.current.itemIds).toEqual([
      'mp-1',
      'mp-2',
      'multi-agent-chat-stage-1',
    ]);
    // Verify no duplicates - only one multi-agent chat per stage
    expect(result.current.itemIds.filter(id => id === 'multi-agent-chat-stage-1').length).toBe(1);
  });

  it('should preserve stored order when auto-prompt is at the beginning', () => {
    const stage = createMockStage({
      itemOrder: ['multi-agent-chat-stage-1', 'mp-1', 'mp-2'],
      miniPrompts: [
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-1',
          order: 0,
          miniPrompt: {
            id: 'mp-1',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-2',
          order: 1,
          miniPrompt: {
            id: 'mp-2',
            userId: 'user-1',
            name: 'Mini Prompt 2',
            description: null,
            content: 'Content 2',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: false,
      includeMultiAgentChat: true,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: true })
    );

    // Should preserve the exact order from itemOrder - auto-prompt at the beginning
    expect(result.current.itemIds).toEqual([
      'multi-agent-chat-stage-1',
      'mp-1',
      'mp-2',
    ]);
  });

  it('should preserve stored order exactly when multi-agent chat is at beginning and includeMultiAgentChat is true', () => {
    const stageId = '68d1c6fe-547f-4e88-89da-ab8bf3009b24';
    const stage = createMockStage({
      id: stageId,
      itemOrder: [
        'multi-agent-chat-68d1c6fe-547f-4e88-89da-ab8bf3009b24',
        'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
        '1e882c19-4c09-4534-b82c-5f473d7bdfb0',
      ],
      miniPrompts: [
        {
          stageId,
          miniPromptId: 'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
          order: 0,
          miniPrompt: {
            id: 'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          stageId,
          miniPromptId: '1e882c19-4c09-4534-b82c-5f473d7bdfb0',
          order: 1,
          miniPrompt: {
            id: '1e882c19-4c09-4534-b82c-5f473d7bdfb0',
            userId: 'user-1',
            name: 'Mini Prompt 2',
            description: null,
            content: 'Content 2',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: false,
      includeMultiAgentChat: true,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: true })
    );

    // Should preserve the exact order from itemOrder - multi-agent chat at the beginning
    expect(result.current.itemIds).toEqual([
      'multi-agent-chat-68d1c6fe-547f-4e88-89da-ab8bf3009b24',
      'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
      '1e882c19-4c09-4534-b82c-5f473d7bdfb0',
    ]);
    
    // Verify itemsMap includes the multi-agent chat
    expect(result.current.itemsMap.has('multi-agent-chat-68d1c6fe-547f-4e88-89da-ab8bf3009b24')).toBe(true);
  });

  it('should preserve stored order even when includeMultiAgentChat prop differs from stage.includeMultiAgentChat', () => {
    const stageId = '68d1c6fe-547f-4e88-89da-ab8bf3009b24';
    const stage = createMockStage({
      id: stageId,
      itemOrder: [
        'multi-agent-chat-68d1c6fe-547f-4e88-89da-ab8bf3009b24',
        'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
      ],
      miniPrompts: [
        {
          stageId,
          miniPromptId: 'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
          order: 0,
          miniPrompt: {
            id: 'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: false,
      includeMultiAgentChat: false, // Stage says false, but itemOrder has it
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: true }) // But prop says true
    );

    // Should preserve the exact order from itemOrder even if stage.includeMultiAgentChat is false
    expect(result.current.itemIds).toEqual([
      'multi-agent-chat-68d1c6fe-547f-4e88-89da-ab8bf3009b24',
      'd6b0e7f8-797d-4ce0-b446-e9fd48d29c12',
    ]);
    
    // Verify itemsMap includes the multi-agent chat because it's in stored order
    expect(result.current.itemsMap.has('multi-agent-chat-68d1c6fe-547f-4e88-89da-ab8bf3009b24')).toBe(true);
  });

  it('should sort mini-prompts by order field in default order', () => {
    const stage = createMockStage({
      itemOrder: undefined,
      miniPrompts: [
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-2',
          order: 1,
          miniPrompt: {
            id: 'mp-2',
            userId: 'user-1',
            name: 'Mini Prompt 2',
            description: null,
            content: 'Content 2',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-1',
          order: 0,
          miniPrompt: {
            id: 'mp-1',
            userId: 'user-1',
            name: 'Mini Prompt 1',
            description: null,
            content: 'Content 1',
            visibility: 'PRIVATE' as const,
            isActive: true,
            isSystemMiniPrompt: false,
            isAutomatic: false,
            position: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
      withReview: true,
      includeMultiAgentChat: false,
    });

    const { result } = renderHook(() =>
      useStageItemOrder({ stage, includeMultiAgentChat: false })
    );

    // Should be sorted by order field (mp-1 first, then mp-2)
    expect(result.current.itemIds).toEqual([
      'mp-1',
      'mp-2',
      'memory-board-stage-1',
    ]);
  });
});

