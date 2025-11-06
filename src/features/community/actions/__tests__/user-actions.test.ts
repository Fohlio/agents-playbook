/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';
import { searchUsers } from '../user-actions';

// Mock dependencies
jest.mock('@/lib/db/client', () => ({
  prisma: prismaMock,
}));

describe('User Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('returns users matching the query (case-insensitive)', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'JohnDoe' },
        { id: 'user-2', username: 'JaneDoyle' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await searchUsers('john');

      expect(result.users).toEqual(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          username: {
            contains: 'john',
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          username: true,
        },
        orderBy: {
          username: 'asc',
        },
        take: 10,
      });
    });

    it('limits results to 10 users', async () => {
      const mockUsers = Array.from({ length: 15 }, (_, i) => ({
        id: `user-${i}`,
        username: `user${i}`,
      }));

      prismaMock.user.findMany.mockResolvedValue(mockUsers.slice(0, 10) as any);

      const result = await searchUsers('user');

      expect(result.users).toHaveLength(10);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('returns empty array when no users match', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await searchUsers('nonexistentuser');

      expect(result.users).toEqual([]);
    });

    it('searches case-insensitively', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'TestUser' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      // Test with lowercase
      await searchUsers('testuser');
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            username: {
              contains: 'testuser',
              mode: 'insensitive',
            },
          },
        })
      );

      // Test with uppercase
      await searchUsers('TESTUSER');
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            username: {
              contains: 'TESTUSER',
              mode: 'insensitive',
            },
          },
        })
      );
    });

    it('returns only id and username fields', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'testuser' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await searchUsers('test');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            id: true,
            username: true,
          },
        })
      );

      // Verify returned users only have expected fields
      result.users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(Object.keys(user)).toHaveLength(2);
      });
    });

    it('handles partial username matches', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'administrator' },
        { id: 'user-2', username: 'admin123' },
        { id: 'user-3', username: 'superadmin' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await searchUsers('admin');

      expect(result.users).toEqual(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            username: {
              contains: 'admin',
              mode: 'insensitive',
            },
          },
        })
      );
    });

    it('returns empty array for empty query string', async () => {
      const result = await searchUsers('');

      expect(result.users).toEqual([]);
      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error('Database error'));

      const result = await searchUsers('test');

      expect(result).toEqual({ users: [] });
    });

    it('trims whitespace from query', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'testuser' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      await searchUsers('  testuser  ');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            username: {
              contains: 'testuser',
              mode: 'insensitive',
            },
          },
        })
      );
    });

    it('handles special characters in query', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'user_123' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      await searchUsers('user_');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            username: {
              contains: 'user_',
              mode: 'insensitive',
            },
          },
        })
      );
    });

    it('returns users ordered by username ascending', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'alice' },
        { id: 'user-2', username: 'bob' },
        { id: 'user-3', username: 'charlie' },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await searchUsers('test');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            username: 'asc',
          },
        })
      );
      expect(result.users).toEqual(mockUsers);
    });

    it('validates minimum query length', async () => {
      const result = await searchUsers('');

      expect(result.users).toEqual([]);
      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });

    it('validates maximum query length (51+ chars)', async () => {
      const longQuery = 'a'.repeat(51);

      const result = await searchUsers(longQuery);

      expect(result.users).toEqual([]);
      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when query is only whitespace', async () => {
      const result = await searchUsers('   ');

      expect(result.users).toEqual([]);
      expect(prismaMock.user.findMany).not.toHaveBeenCalled();
    });
  });
});
