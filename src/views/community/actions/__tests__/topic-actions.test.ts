/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/server/db/__mocks__/client';
import {
  createTopic,
  getTopics,
  deleteTopic,
  togglePinTopic,
  toggleCloseTopic,
} from '../topic-actions';

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

describe('Topic Actions', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockAdminUserId = '123e4567-e89b-12d3-a456-426614174001';
  const mockTopicId = '123e4567-e89b-12d3-a456-426614174002';
  const mockSession = {
    user: {
      id: mockUserId,
      email: 'test@example.com',
      role: 'USER',
    },
  };
  const mockAdminSession = {
    user: {
      id: mockAdminUserId,
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('createTopic', () => {
    const validTopicData = {
      title: 'Test Topic',
      content: 'Test content for the topic',
    };

    it('creates a topic with first message in transaction', async () => {
      const mockTopic = {
        id: mockTopicId,
        title: validTopicData.title,
        authorId: mockUserId,
        isPinned: false,
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.$transaction.mockResolvedValue(mockTopic as any);

      const result = await createTopic(validTopicData);

      expect(result).toEqual({
        success: true,
        data: { topicId: mockTopicId },
      });
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/community');
    });

    it('validates title length (minimum)', async () => {
      const invalidData = {
        title: '',
        content: 'Valid content',
      };

      const result = await createTopic(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('validates title length (maximum 200 chars)', async () => {
      const invalidData = {
        title: 'a'.repeat(201),
        content: 'Valid content',
      };

      const result = await createTopic(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('validates content length (minimum)', async () => {
      const invalidData = {
        title: 'Valid Title',
        content: '',
      };

      const result = await createTopic(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('validates content length (maximum 10000 chars)', async () => {
      const invalidData = {
        title: 'Valid Title',
        content: 'a'.repeat(10001),
      };

      const result = await createTopic(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await createTopic(validTopicData);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      const result = await createTopic(validTopicData);

      expect(result).toEqual({
        success: false,
        error: 'Failed to create topic',
      });
    });
  });

  describe('getTopics', () => {
    it('returns paginated topics sorted by pinned and date', async () => {
      const mockTopics = [
        {
          id: 'topic-1',
          title: 'Pinned Topic',
          isPinned: true,
          isClosed: false,
          createdAt: new Date('2024-01-01'),
          author: { username: 'user1' },
          _count: { messages: 5 },
        },
        {
          id: 'topic-2',
          title: 'Recent Topic',
          isPinned: false,
          isClosed: false,
          createdAt: new Date('2024-01-02'),
          author: { username: 'user2' },
          _count: { messages: 3 },
        },
      ];

      prismaMock.topic.findMany.mockResolvedValue(mockTopics as any);
      prismaMock.topic.count.mockResolvedValue(2);

      const result = await getTopics(1);

      expect(result.topics).toEqual(mockTopics);
      expect(result.totalPages).toBe(1);
      expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' },
          ],
        })
      );
    });

    it('supports pagination', async () => {
      const pageSize = 20;
      prismaMock.topic.findMany.mockResolvedValue([]);
      prismaMock.topic.count.mockResolvedValue(0);

      await getTopics(2);

      expect(prismaMock.topic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: pageSize,
          take: pageSize,
        })
      );
    });

    it('calculates total pages correctly', async () => {
      prismaMock.topic.findMany.mockResolvedValue([]);
      prismaMock.topic.count.mockResolvedValue(45);

      const result = await getTopics(1);

      expect(result.totalPages).toBe(3); // 45 topics / 20 per page = 3 pages
    });

    it('handles database errors gracefully', async () => {
      prismaMock.topic.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getTopics(1);

      expect(result).toEqual({
        topics: [],
        totalPages: 0,
      });
    });
  });

  describe('deleteTopic', () => {
    it('deletes topic when user is owner', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        authorId: mockUserId,
      } as any);
      prismaMock.topic.delete.mockResolvedValue({} as any);

      const result = await deleteTopic(mockTopicId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.topic.delete).toHaveBeenCalledWith({
        where: { id: mockTopicId },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/community');
    });

    it('deletes topic when user is admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        authorId: 'different-user',
      } as any);
      prismaMock.topic.delete.mockResolvedValue({} as any);

      const result = await deleteTopic(mockTopicId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.topic.delete).toHaveBeenCalled();
    });

    it('fails when topic not found', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null);

      const result = await deleteTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Topic not found',
      });
      expect(prismaMock.topic.delete).not.toHaveBeenCalled();
    });

    it('fails when user is neither owner nor admin', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        authorId: 'different-user',
      } as any);

      const result = await deleteTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.topic.delete).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await deleteTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.topic.findUnique).not.toHaveBeenCalled();
    });

    it('cascades delete to messages', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        authorId: mockUserId,
      } as any);
      prismaMock.topic.delete.mockResolvedValue({} as any);

      await deleteTopic(mockTopicId);

      // Delete should cascade due to schema onDelete: Cascade
      expect(prismaMock.topic.delete).toHaveBeenCalledWith({
        where: { id: mockTopicId },
      });
    });
  });

  describe('togglePinTopic', () => {
    it('pins an unpinned topic (admin only)', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      const mockTopic = {
        id: mockTopicId,
        isPinned: false,
      };
      prismaMock.topic.findUnique.mockResolvedValue(mockTopic as any);
      prismaMock.topic.update.mockResolvedValue({
        ...mockTopic,
        isPinned: true,
      } as any);

      const result = await togglePinTopic(mockTopicId);

      expect(result.success).toBe(true);
      expect(result.data?.isPinned).toBe(true);
      expect(prismaMock.topic.update).toHaveBeenCalledWith({
        where: { id: mockTopicId },
        data: { isPinned: true },
        select: { isPinned: true },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/community');
    });

    it('unpins a pinned topic', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      const mockTopic = {
        id: mockTopicId,
        isPinned: true,
      };
      prismaMock.topic.findUnique.mockResolvedValue(mockTopic as any);
      prismaMock.topic.update.mockResolvedValue({
        ...mockTopic,
        isPinned: false,
      } as any);

      const result = await togglePinTopic(mockTopicId);

      expect(result.data?.isPinned).toBe(false);
      expect(prismaMock.topic.update).toHaveBeenCalledWith({
        where: { id: mockTopicId },
        data: { isPinned: false },
        select: { isPinned: true },
      });
    });

    it('fails when user is not admin', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        isPinned: false,
      } as any);

      const result = await togglePinTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized: Admin access required',
      });
      expect(prismaMock.topic.update).not.toHaveBeenCalled();
    });

    it('fails when topic not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.topic.findUnique.mockResolvedValue(null);

      const result = await togglePinTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Topic not found',
      });
      expect(prismaMock.topic.update).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await togglePinTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });
  });

  describe('toggleCloseTopic', () => {
    it('closes an open topic (admin only)', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      const mockTopic = {
        id: mockTopicId,
        isClosed: false,
      };
      prismaMock.topic.findUnique.mockResolvedValue(mockTopic as any);
      prismaMock.topic.update.mockResolvedValue({
        ...mockTopic,
        isClosed: true,
      } as any);

      const result = await toggleCloseTopic(mockTopicId);

      expect(result.success).toBe(true);
      expect(result.data?.isClosed).toBe(true);
      expect(prismaMock.topic.update).toHaveBeenCalledWith({
        where: { id: mockTopicId },
        data: { isClosed: true },
        select: { isClosed: true },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/community');
    });

    it('reopens a closed topic', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      const mockTopic = {
        id: mockTopicId,
        isClosed: true,
      };
      prismaMock.topic.findUnique.mockResolvedValue(mockTopic as any);
      prismaMock.topic.update.mockResolvedValue({
        ...mockTopic,
        isClosed: false,
      } as any);

      const result = await toggleCloseTopic(mockTopicId);

      expect(result.data?.isClosed).toBe(false);
      expect(prismaMock.topic.update).toHaveBeenCalledWith({
        where: { id: mockTopicId },
        data: { isClosed: false },
        select: { isClosed: true },
      });
    });

    it('fails when user is not admin', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        isClosed: false,
      } as any);

      const result = await toggleCloseTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized: Admin access required',
      });
      expect(prismaMock.topic.update).not.toHaveBeenCalled();
    });

    it('fails when topic not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.topic.findUnique.mockResolvedValue(null);

      const result = await toggleCloseTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Topic not found',
      });
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await toggleCloseTopic(mockTopicId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });
  });
});
