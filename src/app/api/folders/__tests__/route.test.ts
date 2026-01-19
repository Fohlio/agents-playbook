/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/server/db/__mocks__/client';

jest.mock('@/server/db/client', () => ({
  prisma: prismaMock,
}));

jest.mock('@/server/auth/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => {
      const response = {
        status: init?.status || 200,
        json: async () => data,
      };
      return response;
    },
  },
}));

import { auth } from '@/server/auth/auth';
import { GET, POST } from '../route';

describe('/api/folders', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/folders', () => {
    it('returns user folders with item count', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockFolders = [
        {
          id: 'folder-1',
          name: 'Folder 1',
          key: 'folder-1',
          description: 'Description 1',
          visibility: 'PRIVATE',
          position: 0,
          deleted_at: null,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
          _count: { folder_items: 5 },
        },
        {
          id: 'folder-2',
          name: 'Folder 2',
          key: 'folder-2',
          description: null,
          visibility: 'PUBLIC',
          position: 1,
          deleted_at: null,
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-03'),
          _count: { folder_items: 3 },
        },
      ];

      prismaMock.folders.findMany.mockResolvedValue(mockFolders as any);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folders).toHaveLength(2);
      expect(json.folders[0].itemCount).toBe(5);
      expect(json.folders[1].itemCount).toBe(3);
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.folders.findMany).not.toHaveBeenCalled();
    });

    it('filters out deleted folders', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findMany.mockResolvedValue([]);

      await GET();

      expect(prismaMock.folders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: 'user-123',
            is_active: true,
            deleted_at: null,
          }),
        })
      );
    });

    it('orders folders by position', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findMany.mockResolvedValue([]);

      await GET();

      expect(prismaMock.folders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { position: 'asc' },
        })
      );
    });

    it('returns empty array when user has no folders', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findMany.mockResolvedValue([]);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folders).toEqual([]);
    });

    it('returns 500 on database error', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to fetch folders');
    });
  });

  describe('POST /api/folders', () => {
    it('creates a new folder with provided data', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: 1 } } as any);

      const mockCreatedFolder = {
        id: 'folder-new',
        name: 'New Folder',
        key: 'new-folder',
        description: 'Test description',
        visibility: 'PRIVATE',
        position: 2,
      };

      prismaMock.folders.create.mockResolvedValue(mockCreatedFolder as any);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Folder',
          description: 'Test description',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder.name).toBe('New Folder');
      expect(json.folder.key).toBe('new-folder');
    });

    it('creates folder with custom visibility', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);

      const mockCreatedFolder = {
        id: 'folder-new',
        name: 'Public Folder',
        key: 'public-folder',
        description: null,
        visibility: 'PUBLIC',
        position: 0,
      };

      prismaMock.folders.create.mockResolvedValue(mockCreatedFolder as any);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Public Folder',
          visibility: 'PUBLIC',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder.visibility).toBe('PUBLIC');
    });

    it('creates folder with custom key', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);

      const mockCreatedFolder = {
        id: 'folder-new',
        name: 'My Folder',
        key: 'custom-key',
        description: null,
        visibility: 'PRIVATE',
        position: 0,
      };

      prismaMock.folders.create.mockResolvedValue(mockCreatedFolder as any);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Folder',
          key: 'custom-key',
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder.key).toBe('custom-key');
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.folders.create).not.toHaveBeenCalled();
    });

    it('returns 400 when name is missing', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Name is required' });
    });

    it('returns 400 when name is not a string', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name: 123 }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Name is required' });
    });

    it('returns 400 on invalid JSON body', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Invalid request body' });
    });

    it('returns 500 on database error', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockRejectedValue(new Error('DB Error'));

      const request = new Request('http://localhost/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Folder' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Failed to create folder');
    });
  });
});
