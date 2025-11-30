/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/server/db/__mocks__/client';
import {
  deleteMiniPrompt,
  toggleMiniPromptVisibility,
} from '../mini-prompt-actions';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: prismaMock,
}));

jest.mock('@/server/auth/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { auth } from '@/server/auth/auth';
import { revalidatePath } from 'next/cache';

describe('Mini-Prompt Actions', () => {
  const mockUserId = 'user-123';
  const mockMiniPromptId = 'mini-prompt-123';
  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('deleteMiniPrompt', () => {
    it('succeeds when mini-prompt is not used in workflows', async () => {
      prismaMock.stageMiniPrompt.count.mockResolvedValue(0);
      prismaMock.miniPrompt.deleteMany.mockResolvedValue({ count: 1 } as any);

      const result = await deleteMiniPrompt(mockMiniPromptId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.miniPrompt.deleteMany).toHaveBeenCalledWith({
        where: { id: mockMiniPromptId, userId: mockUserId },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('fails when mini-prompt is used in workflows', async () => {
      prismaMock.stageMiniPrompt.count.mockResolvedValue(3);

      await expect(deleteMiniPrompt(mockMiniPromptId)).rejects.toThrow(
        'Cannot delete mini-prompt that is used in workflows'
      );

      expect(prismaMock.miniPrompt.deleteMany).not.toHaveBeenCalled();
    });

    it('checks usage count before deletion', async () => {
      prismaMock.stageMiniPrompt.count.mockResolvedValue(0);
      prismaMock.miniPrompt.deleteMany.mockResolvedValue({ count: 1 } as any);

      await deleteMiniPrompt(mockMiniPromptId);

      expect(prismaMock.stageMiniPrompt.count).toHaveBeenCalledWith({
        where: { miniPromptId: mockMiniPromptId },
      });
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(deleteMiniPrompt(mockMiniPromptId)).rejects.toThrow(
        'Unauthorized'
      );

      expect(prismaMock.stageMiniPrompt.count).not.toHaveBeenCalled();
    });

    it('verifies userId ownership with deleteMany', async () => {
      prismaMock.stageMiniPrompt.count.mockResolvedValue(0);
      prismaMock.miniPrompt.deleteMany.mockResolvedValue({ count: 1 } as any);

      await deleteMiniPrompt(mockMiniPromptId);

      expect(prismaMock.miniPrompt.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: mockUserId }),
        })
      );
    });
  });

  describe('toggleMiniPromptVisibility', () => {
    it('switches from PUBLIC to PRIVATE', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: mockMiniPromptId,
        userId: mockUserId,
        visibility: 'PUBLIC',
      } as any);
      prismaMock.miniPrompt.update.mockResolvedValue({} as any);

      const result = await toggleMiniPromptVisibility(mockMiniPromptId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.miniPrompt.update).toHaveBeenCalledWith({
        where: { id: mockMiniPromptId },
        data: { visibility: 'PRIVATE' },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('switches from PRIVATE to PUBLIC', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: mockMiniPromptId,
        userId: mockUserId,
        visibility: 'PRIVATE',
      } as any);
      prismaMock.miniPrompt.update.mockResolvedValue({} as any);

      await toggleMiniPromptVisibility(mockMiniPromptId);

      expect(prismaMock.miniPrompt.update).toHaveBeenCalledWith({
        where: { id: mockMiniPromptId },
        data: { visibility: 'PUBLIC' },
      });
    });

    it('fails when mini-prompt not found', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue(null);

      await expect(
        toggleMiniPromptVisibility(mockMiniPromptId)
      ).rejects.toThrow('Mini-prompt not found');

      expect(prismaMock.miniPrompt.update).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(
        toggleMiniPromptVisibility(mockMiniPromptId)
      ).rejects.toThrow('Unauthorized');
    });

    it('verifies userId ownership', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: mockMiniPromptId,
        userId: mockUserId,
        visibility: 'PUBLIC',
      } as any);
      prismaMock.miniPrompt.update.mockResolvedValue({} as any);

      await toggleMiniPromptVisibility(mockMiniPromptId);

      expect(prismaMock.miniPrompt.findFirst).toHaveBeenCalledWith({
        where: { id: mockMiniPromptId, userId: mockUserId },
      });
    });
  });

  describe('Authorization and Security', () => {
    it('all actions check authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      await expect(deleteMiniPrompt(mockMiniPromptId)).rejects.toThrow();
      await expect(
        toggleMiniPromptVisibility(mockMiniPromptId)
      ).rejects.toThrow();

      expect(auth).toHaveBeenCalledTimes(2);
    });

    it('all actions revalidate /dashboard path', async () => {
      prismaMock.stageMiniPrompt.count.mockResolvedValue(0);
      prismaMock.miniPrompt.deleteMany.mockResolvedValue({ count: 1 } as any);
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: mockMiniPromptId,
        userId: mockUserId,
        visibility: 'PUBLIC',
      } as any);
      prismaMock.miniPrompt.update.mockResolvedValue({} as any);

      await deleteMiniPrompt(mockMiniPromptId);
      await toggleMiniPromptVisibility(mockMiniPromptId);

      expect(revalidatePath).toHaveBeenCalledTimes(2);
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });
});
