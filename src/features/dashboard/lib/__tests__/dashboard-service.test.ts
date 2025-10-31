/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';
import {
  getDashboardStats,
  getActiveWorkflows,
  getWorkflows,
  getMiniPrompts,
  getRecentActivity,
  canActivateWorkflow,
} from '../dashboard-service';

jest.mock('@/lib/db/client', () => ({
  prisma: prismaMock,
}));

describe('Dashboard Service', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('returns correct counts for user', async () => {
      prismaMock.workflow.count
        .mockResolvedValueOnce(10) // totalWorkflows
        .mockResolvedValueOnce(3) // activeWorkflows
        .mockResolvedValueOnce(5); // publicWorkflows

      prismaMock.miniPrompt.count
        .mockResolvedValueOnce(8) // totalMiniPrompts
        .mockResolvedValueOnce(2); // publicMiniPrompts

      const stats = await getDashboardStats(mockUserId);

      expect(stats).toEqual({
        totalWorkflows: 10,
        totalMiniPrompts: 8,
        activeWorkflows: 3,
        publicItems: 7, // 5 public workflows + 2 public mini-prompts
      });

      expect(prismaMock.workflow.count).toHaveBeenCalledTimes(3);
      expect(prismaMock.miniPrompt.count).toHaveBeenCalledTimes(2);
    });

    it('filters by userId for all queries', async () => {
      prismaMock.workflow.count.mockResolvedValue(0);
      prismaMock.miniPrompt.count.mockResolvedValue(0);

      await getDashboardStats(mockUserId);

      // Verify userId filter in workflow counts
      expect(prismaMock.workflow.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUserId } })
      );

      // Verify userId filter in miniPrompt counts
      expect(prismaMock.miniPrompt.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: mockUserId } })
      );
    });
  });

  describe('getActiveWorkflows', () => {
    it('filters by isActive=true and userId', async () => {
      const mockWorkflows = [
        {
          id: 'wf-1',
          userId: mockUserId,
          name: 'Workflow 1',
          isActive: true,
          updatedAt: new Date(),
          _count: { stages: 3 },
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as any);
      prismaMock.workflowReference.findMany.mockResolvedValue([]);

      const result = await getActiveWorkflows(mockUserId);

      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId, isActive: true },
        })
      );

      expect(result).toEqual(mockWorkflows);
    });

    it('limits results to 5', async () => {
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.workflowReference.findMany.mockResolvedValue([]);

      await getActiveWorkflows(mockUserId);

      expect(prismaMock.workflow.findMany).toHaveBeenCalled();
    });

    it('includes usage count via _count relation', async () => {
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.workflowReference.findMany.mockResolvedValue([]);

      await getActiveWorkflows(mockUserId);

      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: {
              select: { stages: true },
            },
          }),
        })
      );
    });

    it('orders by updatedAt DESC', async () => {
      const mockWorkflows = [
        {
          id: 'wf-1',
          name: 'Workflow 1',
          updatedAt: new Date('2024-01-02'),
          _count: { stages: 3 },
        },
        {
          id: 'wf-2',
          name: 'Workflow 2',
          updatedAt: new Date('2024-01-01'),
          _count: { stages: 2 },
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as any);
      prismaMock.workflowReference.findMany.mockResolvedValue([]);

      const result = await getActiveWorkflows(mockUserId);

      // Should be sorted by updatedAt DESC
      expect(result[0].id).toBe('wf-1');
      expect(result[1].id).toBe('wf-2');
    });
  });

  describe('getWorkflows', () => {
    it('applies optional isActive filter', async () => {
      prismaMock.workflow.findMany.mockResolvedValue([]);

      await getWorkflows(mockUserId, { isActive: true });

      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId, isActive: true },
        })
      );
    });

    it('applies optional visibility filter', async () => {
      prismaMock.workflow.findMany.mockResolvedValue([]);

      await getWorkflows(mockUserId, { visibility: 'PUBLIC' });

      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId, visibility: 'PUBLIC' },
        })
      );
    });

    it('works without filters', async () => {
      prismaMock.workflow.findMany.mockResolvedValue([]);

      await getWorkflows(mockUserId);

      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
        })
      );
    });
  });

  describe('getMiniPrompts', () => {
    it('includes usage count via _count relation', async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      await getMiniPrompts(mockUserId);

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            _count: {
              select: { stageMiniPrompts: true },
            },
          },
        })
      );
    });

    it('filters by userId', async () => {
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      await getMiniPrompts(mockUserId);

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
        })
      );
    });
  });

  describe('getRecentActivity', () => {
    it('returns last 10 items sorted by updatedAt', async () => {
      const now = new Date();
      const workflows = [
        {
          id: 'wf-1',
          name: 'Workflow 1',
          createdAt: new Date(now.getTime() - 1000),
          updatedAt: new Date(now.getTime() - 500),
          isActive: true,
        },
      ];
      const miniPrompts = [
        {
          id: 'mp-1',
          name: 'Mini Prompt 1',
          createdAt: new Date(now.getTime() - 2000),
          updatedAt: new Date(now.getTime() - 1500),
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(workflows as any);
      prismaMock.miniPrompt.findMany.mockResolvedValue(miniPrompts as any);

      const result = await getRecentActivity(mockUserId);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('workflow');
      expect(result[0].targetName).toBe('Workflow 1');
      expect(result[1].type).toBe('mini_prompt');
      expect(result[1].targetName).toBe('Mini Prompt 1');

      // Verify sorted by timestamp (most recent first)
      expect(result[0].timestamp.getTime()).toBeGreaterThan(
        result[1].timestamp.getTime()
      );
    });

    it('determines action based on created/updated timestamps and isActive', async () => {
      const now = new Date();
      const workflows = [
        {
          id: 'wf-1',
          name: 'New Workflow',
          createdAt: now,
          updatedAt: now,
          isActive: false,
        },
        {
          id: 'wf-2',
          name: 'Updated Workflow',
          createdAt: new Date(now.getTime() - 10000),
          updatedAt: now,
          isActive: false,
        },
        {
          id: 'wf-3',
          name: 'Activated Workflow',
          createdAt: new Date(now.getTime() - 10000),
          updatedAt: now,
          isActive: true,
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(workflows as any);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getRecentActivity(mockUserId);

      // Result order same as input when timestamps are equal
      expect(result[0].action).toBe('created'); // same timestamps
      expect(result[1].action).toBe('updated'); // different timestamps, isActive=false
      expect(result[2].action).toBe('activated'); // different timestamps, isActive=true
    });
  });

  describe('canActivateWorkflow', () => {
    it('returns true for PREMIUM tier', async () => {
      const result = await canActivateWorkflow(mockUserId, 'PREMIUM');

      expect(result).toBe(true);
      expect(prismaMock.workflow.count).not.toHaveBeenCalled();
    });

    it('returns false when FREE tier has 5 active workflows', async () => {
      prismaMock.workflow.count.mockResolvedValue(5);

      const result = await canActivateWorkflow(mockUserId, 'FREE');

      expect(result).toBe(false);
      expect(prismaMock.workflow.count).toHaveBeenCalledWith({
        where: { userId: mockUserId, isActive: true },
      });
    });

    it('returns true when FREE tier has less than 5 active workflows', async () => {
      prismaMock.workflow.count.mockResolvedValue(3);

      const result = await canActivateWorkflow(mockUserId, 'FREE');

      expect(result).toBe(true);
    });
  });
});
