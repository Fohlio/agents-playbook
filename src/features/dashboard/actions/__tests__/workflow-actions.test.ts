/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';
import {
  activateWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  toggleWorkflowVisibility,
} from '../workflow-actions';

// Mock dependencies
jest.mock('@/lib/db/client', () => ({
  prisma: prismaMock,
}));

jest.mock('@/lib/auth/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Note: canActivateWorkflow mock removed - function no longer exists
// 5-workflow limit has been removed

import { auth } from '@/lib/auth/auth';
import { revalidatePath } from 'next/cache';

describe('Workflow Actions', () => {
  const mockUserId = 'user-123';
  const mockWorkflowId = 'workflow-123';
  const mockSession = {
    user: {
      id: mockUserId,
      tier: 'FREE',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('activateWorkflow', () => {
    it('succeeds for any user', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: mockWorkflowId,
        userId: mockUserId,
        isActive: false,
      } as any);
      prismaMock.workflow.update.mockResolvedValue({} as any);

      const result = await activateWorkflow(mockWorkflowId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.workflow.update).toHaveBeenCalledWith({
        where: { id: mockWorkflowId },
        data: { isActive: true },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    // Note: Test removed - 5-workflow limit has been removed
    // Users can now activate unlimited workflows regardless of tier

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(activateWorkflow(mockWorkflowId)).rejects.toThrow(
        'Unauthorized'
      );

      expect(prismaMock.workflow.findFirst).not.toHaveBeenCalled();
    });

    it('fails when user does not own workflow', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      await expect(activateWorkflow(mockWorkflowId)).rejects.toThrow(
        'Workflow not found'
      );

      expect(prismaMock.workflow.update).not.toHaveBeenCalled();
    });

    it('verifies ownership before activation', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: mockWorkflowId,
        userId: mockUserId,
      } as any);
      prismaMock.workflow.update.mockResolvedValue({} as any);

      await activateWorkflow(mockWorkflowId);

      expect(prismaMock.workflow.findFirst).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, userId: mockUserId },
      });
    });
  });

  describe('deactivateWorkflow', () => {
    it('updates isActive to false', async () => {
      prismaMock.workflow.updateMany.mockResolvedValue({ count: 1 } as any);

      const result = await deactivateWorkflow(mockWorkflowId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.workflow.updateMany).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, userId: mockUserId },
        data: { isActive: false },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(deactivateWorkflow(mockWorkflowId)).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('verifies userId ownership with updateMany', async () => {
      prismaMock.workflow.updateMany.mockResolvedValue({ count: 1 } as any);

      await deactivateWorkflow(mockWorkflowId);

      expect(prismaMock.workflow.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: mockUserId }),
        })
      );
    });
  });

  describe('deleteWorkflow', () => {
    it('removes workflow from database', async () => {
      prismaMock.workflow.deleteMany.mockResolvedValue({ count: 1 } as any);

      const result = await deleteWorkflow(mockWorkflowId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.workflow.deleteMany).toHaveBeenCalledWith({
        where: { id: mockWorkflowId, userId: mockUserId },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(deleteWorkflow(mockWorkflowId)).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('toggleWorkflowVisibility', () => {
    it('switches from PUBLIC to PRIVATE', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: mockWorkflowId,
        userId: mockUserId,
        visibility: 'PUBLIC',
      } as any);
      prismaMock.workflow.update.mockResolvedValue({} as any);

      const result = await toggleWorkflowVisibility(mockWorkflowId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.workflow.update).toHaveBeenCalledWith({
        where: { id: mockWorkflowId },
        data: { visibility: 'PRIVATE' },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('switches from PRIVATE to PUBLIC', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: mockWorkflowId,
        userId: mockUserId,
        visibility: 'PRIVATE',
      } as any);
      prismaMock.workflow.update.mockResolvedValue({} as any);

      await toggleWorkflowVisibility(mockWorkflowId);

      expect(prismaMock.workflow.update).toHaveBeenCalledWith({
        where: { id: mockWorkflowId },
        data: { visibility: 'PUBLIC' },
      });
    });

    it('fails when workflow not found', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      await expect(
        toggleWorkflowVisibility(mockWorkflowId)
      ).rejects.toThrow('Workflow not found');

      expect(prismaMock.workflow.update).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(
        toggleWorkflowVisibility(mockWorkflowId)
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Authorization and Security', () => {
    it('all actions check authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(activateWorkflow(mockWorkflowId)).rejects.toThrow();
      await expect(deactivateWorkflow(mockWorkflowId)).rejects.toThrow();
      await expect(deleteWorkflow(mockWorkflowId)).rejects.toThrow();
      await expect(toggleWorkflowVisibility(mockWorkflowId)).rejects.toThrow();

      expect(auth).toHaveBeenCalledTimes(4);
    });

    it('all actions revalidate /dashboard path', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: mockWorkflowId,
        userId: mockUserId,
      } as any);
      prismaMock.workflow.update.mockResolvedValue({} as any);
      prismaMock.workflow.updateMany.mockResolvedValue({ count: 1 } as any);
      prismaMock.workflow.deleteMany.mockResolvedValue({ count: 1 } as any);

      await activateWorkflow(mockWorkflowId);
      await deactivateWorkflow(mockWorkflowId);
      await deleteWorkflow(mockWorkflowId);
      await toggleWorkflowVisibility(mockWorkflowId);

      expect(revalidatePath).toHaveBeenCalledTimes(4);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });
});
