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
      prismaMock.messageVote.findUnique.mockResolvedValue(null);
      prismaMock.messageVote.create.mockResolvedValue(mockVote as any);
      prismaMock.messageVote.count.mockResolvedValue(5);

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { voteCount: 5, hasVoted: true },
      });
      expect(prismaMock.messageVote.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          messageId: mockMessageId,
        },
      });
      expect(prismaMock.messageVote.count).toHaveBeenCalledWith({
        where: { messageId: mockMessageId },
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
      prismaMock.messageVote.findUnique.mockResolvedValue(existingVote as any);
      prismaMock.messageVote.delete.mockResolvedValue(existingVote as any);
      prismaMock.messageVote.count.mockResolvedValue(3);

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: true,
        data: { voteCount: 3, hasVoted: false },
      });
      expect(prismaMock.messageVote.delete).toHaveBeenCalledWith({
        where: { id: mockVoteId },
      });
      expect(prismaMock.messageVote.count).toHaveBeenCalledWith({
        where: { messageId: mockMessageId },
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
      expect(prismaMock.messageVote.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.messageVote.create).not.toHaveBeenCalled();
      expect(prismaMock.messageVote.delete).not.toHaveBeenCalled();
    });

    it('fails when message not found', async () => {
      prismaMock.message.findUnique.mockResolvedValue(null);

      const result = await toggleMessageVote(mockMessageId);

      expect(result).toEqual({
        success: false,
        error: 'Message not found',
      });
      expect(prismaMock.messageVote.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.messageVote.create).not.toHaveBeenCalled();
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

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.messageVote.findUnique.mockResolvedValue(null);
      prismaMock.messageVote.create.mockResolvedValue({} as any);
      prismaMock.messageVote.count.mockResolvedValue(1);

      await toggleMessageVote(mockMessageId);

      expect(prismaMock.messageVote.findUnique).toHaveBeenCalledWith({
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
      prismaMock.messageVote.findUnique.mockResolvedValue(null);
      prismaMock.messageVote.create.mockResolvedValue({} as any);
      prismaMock.messageVote.count.mockResolvedValue(10);

      let result = await toggleMessageVote(mockMessageId);
      expect(result.data?.voteCount).toBe(10);

      // Test removing vote
      const existingVote = {
        id: mockVoteId,
        userId: mockUserId,
        messageId: mockMessageId,
      };
      prismaMock.messageVote.findUnique.mockResolvedValue(existingVote as any);
      prismaMock.messageVote.delete.mockResolvedValue(existingVote as any);
      prismaMock.messageVote.count.mockResolvedValue(9);

      result = await toggleMessageVote(mockMessageId);
      expect(result.data?.voteCount).toBe(9);
    });

    it('handles database errors gracefully when creating vote', async () => {
      const mockMessage = {
        id: mockMessageId,
        authorId: 'different-user',
      };

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.messageVote.findUnique.mockResolvedValue(null);
      prismaMock.messageVote.create.mockRejectedValue(new Error('Database error'));

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
      prismaMock.messageVote.findUnique.mockResolvedValue(existingVote as any);
      prismaMock.messageVote.delete.mockRejectedValue(new Error('Database error'));

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

      prismaMock.message.findUnique.mockResolvedValue(mockMessage as any);
      prismaMock.messageVote.findUnique.mockResolvedValue(null);
      prismaMock.messageVote.create.mockResolvedValue({} as any);
      prismaMock.messageVote.count.mockResolvedValue(7);

      await toggleMessageVote(mockMessageId);

      expect(prismaMock.messageVote.count).toHaveBeenCalledWith({
        where: { messageId: mockMessageId },
      });
    });
  });
});
