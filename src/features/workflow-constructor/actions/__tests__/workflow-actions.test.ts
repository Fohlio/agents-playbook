/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';
import {
  getWorkflowWithStages,
  getAllAvailableMiniPrompts,
  saveWorkflow,
} from '../workflow-actions';
import type { SaveWorkflowInput } from '@/lib/types/workflow-constructor-types';

jest.mock('@/lib/db/client', () => ({
  prisma: prismaMock,
}));

describe('Workflow Constructor Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWorkflowWithStages', () => {
    it('fetches workflow with stages and mini-prompts', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        stages: [
          {
            id: 'stage-1',
            name: 'Analysis',
            color: '#3B82F6',
            order: 0,
            miniPrompts: [
              {
                id: 'smp-1',
                order: 0,
                miniPrompt: {
                  id: 'mp-1',
                  name: 'Ask Questions',
                  content: 'Content here',
                },
              },
            ],
          },
        ],
      };

      prismaMock.workflow.findUnique.mockResolvedValue(mockWorkflow as any);

      const result = await getWorkflowWithStages('workflow-1');

      expect(result).toEqual(mockWorkflow);
      expect(prismaMock.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: 'workflow-1' },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          stages: {
            include: {
              miniPrompts: {
                include: {
                  miniPrompt: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });

    it('returns null when workflow not found', async () => {
      prismaMock.workflow.findUnique.mockResolvedValue(null);

      const result = await getWorkflowWithStages('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAllAvailableMiniPrompts', () => {
    it('fetches user mini-prompts only', async () => {
      const mockMiniPrompts = [
        { id: 'mp-1', name: 'User Prompt 1', userId: 'user-1', visibility: 'PRIVATE', createdAt: new Date() },
        { id: 'mp-2', name: 'User Prompt 2', userId: 'user-1', visibility: 'PUBLIC', createdAt: new Date() },
      ];

      prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as any);
      prismaMock.miniPromptReference.findMany.mockResolvedValue([]);

      const result = await getAllAvailableMiniPrompts('user-1');

      expect(result).toEqual(mockMiniPrompts);
      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        }
      });
    });

    it('returns empty array when no prompts available', async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);
      prismaMock.miniPromptReference.findMany.mockResolvedValue([]);

      const result = await getAllAvailableMiniPrompts('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('saveWorkflow', () => {
    const mockInput: SaveWorkflowInput = {
      workflowId: 'workflow-1',
      name: 'Updated Workflow',
      description: 'Updated description',
      isActive: true,
      stages: [
        {
          name: 'Analysis Phase',
          description: 'Analysis stage',
          color: '#3B82F6',
          order: 0,
          miniPrompts: [
            { miniPromptId: 'mp-1', order: 0 },
            { miniPromptId: 'mp-2', order: 1 },
          ],
        },
        {
          name: 'Implementation Phase',
          description: 'Implementation stage',
          color: '#10B981',
          order: 1,
          miniPrompts: [
            { miniPromptId: 'mp-3', order: 0 },
          ],
        },
      ],
    };

    const mockWorkflowResult = {
      id: 'workflow-1',
      name: 'Updated Workflow',
      description: 'Updated description',
      isActive: true,
      stages: [
        {
          id: 'stage-1',
          name: 'Analysis Phase',
          miniPrompts: [
            { miniPrompt: { id: 'mp-1', name: 'Prompt 1' } },
            { miniPrompt: { id: 'mp-2', name: 'Prompt 2' } },
          ],
        },
        {
          id: 'stage-2',
          name: 'Implementation Phase',
          miniPrompts: [
            { miniPrompt: { id: 'mp-3', name: 'Prompt 3' } },
          ],
        },
      ],
    };

    it('updates workflow and recreates all stages', async () => {
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          workflow: {
            update: jest.fn().mockResolvedValue({ id: 'workflow-1' }),
            findUniqueOrThrow: jest.fn().mockResolvedValue(mockWorkflowResult),
          },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
            create: jest.fn()
              .mockResolvedValueOnce({ id: 'stage-1' })
              .mockResolvedValueOnce({ id: 'stage-2' }),
          },
          stageMiniPrompt: {
            createMany: jest.fn().mockResolvedValue({ count: 3 }),
          },
        });
      });

      const result = await saveWorkflow(mockInput);

      expect(result).toEqual(mockWorkflowResult);
    });

    it('handles transaction rollback on error', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(saveWorkflow(mockInput)).rejects.toThrow('Transaction failed');
    });

    it('handles stages without mini-prompts', async () => {
      const inputWithoutPrompts: SaveWorkflowInput = {
        ...mockInput,
        stages: [
          {
            name: 'Empty Stage',
            description: 'No prompts',
            color: '#64748b',
            order: 0,
            miniPrompts: [],
          },
        ],
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          workflow: {
            update: jest.fn().mockResolvedValue({ id: 'workflow-1' }),
            findUniqueOrThrow: jest.fn().mockResolvedValue({
              id: 'workflow-1',
              stages: [{ id: 'stage-1', miniPrompts: [] }],
            }),
          },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
          },
          stageMiniPrompt: {
            createMany: jest.fn(),
          },
        });
      });

      const result = await saveWorkflow(inputWithoutPrompts);

      expect(result).toBeDefined();
    });

    it('applies default color when color is undefined', async () => {
      let createdStage: any;

      const inputWithoutColor: SaveWorkflowInput = {
        ...mockInput,
        stages: [
          {
            name: 'Stage without color',
            order: 0,
            miniPrompts: [],
          },
        ],
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          workflow: {
            update: jest.fn().mockResolvedValue({ id: 'workflow-1' }),
            findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'workflow-1', stages: [] }),
          },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockImplementation((data) => {
              createdStage = data.data;
              return Promise.resolve({ id: 'stage-1' });
            }),
          },
          stageMiniPrompt: {
            createMany: jest.fn(),
          },
        });
      });

      await saveWorkflow(inputWithoutColor);

      expect(createdStage.color).toBe('#64748b');
    });

    it('deletes existing stages before creating new ones', async () => {
      const callOrder: string[] = [];
      const deleteManySpy = jest.fn().mockImplementation(() => {
        callOrder.push('delete');
        return Promise.resolve({ count: 3 });
      });
      const createSpy = jest.fn().mockImplementation(() => {
        callOrder.push('create');
        return Promise.resolve({ id: 'stage-1' });
      });

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          workflow: {
            update: jest.fn().mockResolvedValue({ id: 'workflow-1' }),
            findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'workflow-1', stages: [] }),
          },
          workflowStage: {
            deleteMany: deleteManySpy,
            create: createSpy,
          },
          stageMiniPrompt: {
            createMany: jest.fn(),
          },
        });
      });

      await saveWorkflow(mockInput);

      expect(deleteManySpy).toHaveBeenCalledWith({
        where: { workflowId: 'workflow-1' },
      });
      expect(callOrder[0]).toBe('delete');
      expect(callOrder.indexOf('delete')).toBeLessThan(callOrder.indexOf('create'));
    });

    it('creates stages in the correct order', async () => {
      const createCalls: any[] = [];

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return await callback({
          workflow: {
            update: jest.fn().mockResolvedValue({ id: 'workflow-1' }),
            findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'workflow-1', stages: [] }),
          },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockImplementation((data) => {
              createCalls.push(data.data);
              return Promise.resolve({ id: `stage-${createCalls.length}` });
            }),
          },
          stageMiniPrompt: {
            createMany: jest.fn(),
          },
        });
      });

      await saveWorkflow(mockInput);

      expect(createCalls[0].order).toBe(0);
      expect(createCalls[0].name).toBe('Analysis Phase');
      expect(createCalls[1].order).toBe(1);
      expect(createCalls[1].name).toBe('Implementation Phase');
    });
  });
});
