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
import { GET, PATCH, DELETE } from '../route';

describe('/api/folders/[id]', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockRouteParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/folders/[id]', () => {
    it('returns folder by ID', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        description: 'Description',
        visibility: 'PRIVATE',
        position: 0,
      };

      prismaMock.folders.findFirst.mockResolvedValue(mockFolder as any);

      const request = new Request('http://localhost/api/folders/folder-1');
      const response = await GET(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder).toEqual(mockFolder);
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/folder-1');
      const response = await GET(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 404 when folder not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/non-existent');
      const response = await GET(request, mockRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json).toEqual({ error: 'Folder not found' });
    });

    it('verifies user ownership', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/folder-1');
      await GET(request, mockRouteParams('folder-1'));

      expect(prismaMock.folders.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'folder-1',
            user_id: 'user-123',
          }),
        })
      );
    });
  });

  describe('PATCH /api/folders/[id]', () => {
    it('updates folder name', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: 'user-123',
        deleted_at: null,
      } as any);

      const updatedFolder = {
        id: 'folder-1',
        name: 'Updated Name',
        key: 'test-folder',
        description: null,
        visibility: 'PRIVATE',
        position: 0,
      };

      prismaMock.folders.update.mockResolvedValue(updatedFolder as any);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated Name' }),
      });

      const response = await PATCH(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder.name).toBe('Updated Name');
    });

    it('updates folder visibility', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: 'user-123',
        deleted_at: null,
      } as any);

      const updatedFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        description: null,
        visibility: 'PUBLIC',
        position: 0,
      };

      prismaMock.folders.update.mockResolvedValue(updatedFolder as any);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'PATCH',
        body: JSON.stringify({ visibility: 'PUBLIC' }),
      });

      const response = await PATCH(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder.visibility).toBe('PUBLIC');
    });

    it('updates folder position', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: 'user-123',
        deleted_at: null,
      } as any);

      const updatedFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        description: null,
        visibility: 'PRIVATE',
        position: 5,
      };

      prismaMock.folders.update.mockResolvedValue(updatedFolder as any);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'PATCH',
        body: JSON.stringify({ position: 5 }),
      });

      const response = await PATCH(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.folder.position).toBe(5);
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PATCH(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 when folder not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/non-existent', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PATCH(request, mockRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Folder not found');
    });

    it('returns 400 on invalid JSON body', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'PATCH',
        body: 'invalid json',
      });

      const response = await PATCH(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Invalid request body' });
    });
  });

  describe('DELETE /api/folders/[id]', () => {
    it('soft deletes folder', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: 'user-123',
        deleted_at: null,
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ success: true });
    });

    it('removes folder_items when deleting folder', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: 'user-123',
        deleted_at: null,
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'DELETE',
      });

      await DELETE(request, mockRouteParams('folder-1'));

      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/folder-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, mockRouteParams('folder-1'));
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    it('returns 500 when folder not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const request = new Request('http://localhost/api/folders/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, mockRouteParams('non-existent'));
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe('Folder not found');
    });
  });
});
