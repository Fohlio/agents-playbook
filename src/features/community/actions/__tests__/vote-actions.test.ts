/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';
import { toggleMessageVote } from '../vote-actions';

// Mock dependencies
jest.mock('@/lib/db/client', () => ({
  prisma: prismaMock,
}));

jest.mock('@/lib/auth/auth', () => ({
  auth: jest.fn(),
}));

import { auth } from '@/lib/auth/auth';

describe('Vote Actions', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockMessageId = '123e4567-e89b-12d3-a456-426614174003';
  const mockVoteId = '123e4567-e89b-12d3-a456-426614174004';
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

  describe('toggleMessageVote', () => {
    it('creates a vote when user has not voted', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };
      const mockVote = {
        id: mockVoteId,
        userId: mockUserId,
        messageId: mockMessageId,
        createdAt: new Date(),
      };

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          messageVote: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue(mockVote as any),
            count: jest.fn().mockResolvedValue(5),
          },
        };
        return await callback(tx);
      });

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { voteCount: 5, hasVoted: true },
      });
    });

    it('removes vote when user has already voted', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };
      const existingVote = {
        id: mockVoteId,
        userId: mockUserId,
        messageId: mockMessageId,
      };

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          messageVote: {
            findUnique: jest.fn().mockResolvedValue(existingVote as any),
            delete: jest.fn().mockResolvedValue(existingVote as any),
            count: jest.fn().mockResolvedValue(3),
          },
        };
        return await callback(tx);
      });

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { voteCount: 3, hasVoted: false },
      });
    });

    it('prevents users from voting on their own messages', async () => {
      prismaMock.message.findUnique.mockResolvedValue({
        id: mockMessageId,
        authorId: mockUserId, // Same as session user
      } as any);

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Cannot vote on your own message',
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('fails when message not found', async () => {
      prismaMock.message.findUnique.mockResolvedValue(null);

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Message not found',
      });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('fails when unauthenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });
      expect(prismaMock.message.findUnique).not.toHaveBeenCalled();
    });

    it('uses composite unique key to check for existing vote', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };

      const findUniqueMock = jest.fn().mockResolvedValue(null);
      const createMock = jest.fn().mockResolvedValue({} as any);
      const countMock = jest.fn().mockResolvedValue(1);

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          messageVote: {
            findUnique: findUniqueMock,
            create: createMock,
            count: countMock,
          },
        };
        return await callback(tx);
      });

      await toggleMessageVote(mockMessageId);

      expect(findUniqueMock).toHaveBeenCalledWith({
        where: {
          messageId_userId: {
            messageId: mockMessageId,
            userId: mockUserId,
          },
        },
      });
    });

    it('returns updated vote count after toggle', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };

      // Test adding vote
      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockImplementationOnce(async (callback: any) => {
        const tx = {
          messageVote: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({} as any),
            count: jest.fn().mockResolvedValue(10),
          },
        };
        return await callback(tx);
      });

      let result = await toggleMessageVote(mockMessageId);
      expect(result.data?.voteCount).toBe(10);

      // Test removing vote
      const existingVote = {
        id: mockVoteId,
        userId: mockUserId,
        messageId: mockMessageId,
      };
      prismaMock.$transaction.mockImplementationOnce(async (callback: any) => {
        const tx = {
          messageVote: {
            findUnique: jest.fn().mockResolvedValue(existingVote as any),
            delete: jest.fn().mockResolvedValue(existingVote as any),
            count: jest.fn().mockResolvedValue(9),
          },
        };
        return await callback(tx);
      });

      result = await toggleMessageVote(mockMessageId);
      expect(result.data?.voteCount).toBe(9);
    });

    it('handles database errors gracefully when creating vote', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Failed to toggle vote',
      });
    });

    it('handles database errors gracefully when removing vote', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };
      const existingVote = {
        id: mockVoteId,
        userId: mockUserId,
        messageId: mockMessageId,
      };

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockRejectedValue(new Error('Database error'));

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Failed to toggle vote',
      });
    });

    it('counts votes after successful toggle', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };

      const countMock = jest.fn().mockResolvedValue(7);

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          messageVote: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({} as any),
            count: countMock,
          },
        };
        return await callback(tx);
      });

      await toggleMessageVote(mockMessageId);

      expect(countMock).toHaveBeenCalledWith({
        where: { messageId: mockMessageId },
      });
    });
  });
});
