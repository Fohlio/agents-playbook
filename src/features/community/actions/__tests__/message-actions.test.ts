/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';
import {
  createMessage,
  getMessages,
  deleteMessage,
} from '../message-actions';

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

import { auth } from '@/lib/auth/auth';
import { revalidatePath } from 'next/cache';

describe('Message Actions', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockAdminUserId = '123e4567-e89b-12d3-a456-426614174001';
  const mockTopicId = '123e4567-e89b-12d3-a456-426614174002';
  const mockMessageId = '123e4567-e89b-12d3-a456-426614174003';
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

  describe('createMessage', () => {
    const validMessageData = {
      topicId: mockTopicId,
      content: 'This is a test message',
    };

    it('creates a message successfully', async () => {
      const mockTopic = {
        id: mockTopicId,
        isClosed: false,
      };
      const mockMessage = {
        id: mockMessageId,
        topicId: mockTopicId,
        authorId: mockUserId,
        content: validMessageData.content,
        isFirstMessage: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: { username: 'testuser' },
        _count: { votes: 0 },
        votes: [],
      };

      prismaMock.topic.findUnique.mockResolvedValue(mockTopic as any);
      prismaMock.message.create.mockResolvedValue(mockMessage as any);

      const result = await createMessage(validMessageData);

      expect(result.success).toBe(true);
      expect(result.data?.message).toEqual(mockMessage);
      expect(prismaMock.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            topicId: mockTopicId,
            authorId: mockUserId,
            content: validMessageData.content,
            isFirstMessage: false,
          },
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/community/${mockTopicId}`);
    });

    it('includes author, vote count, and user votes in response', async () => {
      const mockTopic = { id: mockTopicId, isClosed: false };
      const mockMessage = {
        id: mockMessageId,
        author: { username: 'testuser' },
        _count: { votes: 5 },
        votes: [{ id: 'vote-1', userId: mockUserId, messageId: mockMessageId, createdAt: new Date() }],
      };

      prismaMock.topic.findUnique.mockResolvedValue(mockTopic as any);
      prismaMock.message.create.mockResolvedValue(mockMessage as any);

      const result = await createMessage(validMessageData);

      expect(result.data?.message).toHaveProperty('author');
      expect(result.data?.message).toHaveProperty('_count');
      expect(result.data?.message).toHaveProperty('votes');
      expect(prismaMock.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            author: { select: { username: true } },
            _count: { select: { votes: true } },
            votes: expect.any(Object),
          },
        })
      );
    });

    it('validates content length (minimum)', async () => {
      const invalidData = {
        topicId: mockTopicId,
        content: '',
      };

      const result = await createMessage(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.topic.findUnique).not.toHaveBeenCalled();
    });

    it('validates content length (maximum 10000 chars)', async () => {
      const invalidData = {
        topicId: mockTopicId,
        content: 'a'.repeat(10001),
      };

      const result = await createMessage(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.topic.findUnique).not.toHaveBeenCalled();
    });

    it('validates topicId is UUID', async () => {
      const invalidData = {
        topicId: 'invalid-uuid',
        content: 'Valid content',
      };

      const result = await createMessage(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(prismaMock.topic.findUnique).not.toHaveBeenCalled();
    });

    it('fails when topic not found', async () => {
      prismaMock.topic.findUnique.mockResolvedValue(null);

      const result = await createMessage(validMessageData);

      expect(result).toEqual({
        success: false,
        error: 'Topic not found',
      });
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it('fails when topic is closed', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({
        id: mockTopicId,
        isClosed: true,
      } as any);

      const result = await createMessage(validMessageData);

      expect(result).toEqual({
        success: false,
        error: 'Cannot add messages to closed topic',
      });
      expect(prismaMock.message.create).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await createMessage(validMessageData);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.topic.findUnique).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      prismaMock.topic.findUnique.mockResolvedValue({ id: mockTopicId, isClosed: false } as any);
      prismaMock.message.create.mockRejectedValue(new Error('Database error'));

      const result = await createMessage(validMessageData);

      expect(result).toEqual({
        success: false,
        error: 'Failed to create message',
      });
    });
  });

  describe('getMessages', () => {
    it('returns paginated messages with vote info', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'First message',
          isFirstMessage: true,
          author: { username: 'user1' },
          _count: { votes: 5 },
          votes: [{ id: 'vote-1', userId: mockUserId, messageId: 'msg-1', createdAt: new Date() }],
        },
        {
          id: 'msg-2',
          content: 'Second message',
          isFirstMessage: false,
          author: { username: 'user2' },
          _count: { votes: 3 },
          votes: [],
        },
      ];

      prismaMock.message.findMany.mockResolvedValue(mockMessages as any);
      prismaMock.message.count.mockResolvedValue(2);

      const result = await getMessages(mockTopicId, 1);

      expect(result.messages).toEqual(mockMessages);
      expect(result.totalPages).toBe(1);
      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { topicId: mockTopicId },
          orderBy: { createdAt: 'asc' },
        })
      );
    });

    it('includes user votes when authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.message.findMany.mockResolvedValue([]);
      prismaMock.message.count.mockResolvedValue(0);

      await getMessages(mockTopicId, 1);

      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            votes: {
              where: { userId: mockUserId },
              select: { id: true, userId: true, messageId: true, createdAt: true },
            },
          }),
        })
      );
    });

    it('excludes user votes when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);
      prismaMock.message.findMany.mockResolvedValue([]);
      prismaMock.message.count.mockResolvedValue(0);

      await getMessages(mockTopicId, 1);

      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            votes: false,
          }),
        })
      );
    });

    it('supports pagination', async () => {
      const pageSize = 50;
      prismaMock.message.findMany.mockResolvedValue([]);
      prismaMock.message.count.mockResolvedValue(0);

      await getMessages(mockTopicId, 2);

      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: pageSize,
          take: pageSize,
        })
      );
    });

    it('calculates total pages correctly', async () => {
      prismaMock.message.findMany.mockResolvedValue([]);
      prismaMock.message.count.mockResolvedValue(125);

      const result = await getMessages(mockTopicId, 1);

      expect(result.totalPages).toBe(3); // 125 messages / 50 per page = 3 pages
    });

    it('orders messages by creation time ascending', async () => {
      prismaMock.message.findMany.mockResolvedValue([]);
      prismaMock.message.count.mockResolvedValue(0);

      await getMessages(mockTopicId, 1);

      expect(prismaMock.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        })
      );
    });

    it('handles database errors gracefully', async () => {
      prismaMock.message.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getMessages(mockTopicId, 1);

      expect(result).toEqual({
        messages: [],
        totalPages: 0,
      });
    });
  });

  describe('deleteMessage', () => {
    it('deletes a regular message when user is owner', async () => {
      prismaMock.message.findUnique.mockResolvedValue({
        id: mockMessageId,
        authorId: mockUserId,
        isFirstMessage: false,
        topicId: mockTopicId,
      } as any);
      prismaMock.message.delete.mockResolvedValue({} as any);

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { deletedTopic: false },
      });
      expect(prismaMock.message.delete).toHaveBeenCalledWith({
        where: { id: mockMessageId },
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/dashboard/community/${mockTopicId}`);
    });

    it('deletes entire topic when deleting first message', async () => {
      prismaMock.message.findUnique.mockResolvedValue({
        id: mockMessageId,
        authorId: mockUserId,
        isFirstMessage: true,
        topicId: mockTopicId,
      } as any);
      prismaMock.topic.delete.mockResolvedValue({} as any);

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { deletedTopic: true },
      });
      expect(prismaMock.topic.delete).toHaveBeenCalledWith({
        where: { id: mockTopicId },
      });
      expect(prismaMock.message.delete).not.toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/community');
    });

    it('deletes message when user is admin', async () => {
      (auth as jest.Mock).mockResolvedValue(mockAdminSession);
      prismaMock.message.findUnique.mockResolvedValue({
        id: mockMessageId,
        authorId: 'different-user',
        isFirstMessage: false,
        topicId: mockTopicId,
      } as any);
      prismaMock.message.delete.mockResolvedValue({} as any);

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { deletedTopic: false },
      });
      expect(prismaMock.message.delete).toHaveBeenCalled();
    });

    it('fails when message not found', async () => {
      prismaMock.message.findUnique.mockResolvedValue(null);

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Message not found',
      });
      expect(prismaMock.message.delete).not.toHaveBeenCalled();
      expect(prismaMock.topic.delete).not.toHaveBeenCalled();
    });

    it('fails when user is neither owner nor admin', async () => {
      prismaMock.message.findUnique.mockResolvedValue({
        id: mockMessageId,
        authorId: 'different-user',
        isFirstMessage: false,
        topicId: mockTopicId,
      } as any);

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.message.delete).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.message.findUnique).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      prismaMock.message.findUnique.mockResolvedValue({
        id: mockMessageId,
        authorId: mockUserId,
        isFirstMessage: false,
        topicId: mockTopicId,
      } as any);
      prismaMock.message.delete.mockRejectedValue(new Error('Database error'));

      const result = await deleteMessage(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Failed to delete message',
      });
    });
  });
});
