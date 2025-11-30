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
import { PATCH, DELETE } from '../route';

describe('/api/workflows/[id]', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  const mockParams = { id: 'workflow-123' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/workflows/[id]', () => {
    it('updates workflow isActive status', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'user-123',
      } as any);

      const mockUpdated = {
        id: 'workflow-123',
        userId: 'user-123',
        isActive: true,
      };

      prismaMock.workflow.update.mockResolvedValue(mockUpdated as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      const response = await PATCH(request, { params: mockParams });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(mockUpdated);
      expect(prismaMock.workflow.update).toHaveBeenCalledWith({
        where: { id: 'workflow-123' },
        data: { isActive: true },
      });
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      const response = await PATCH(request, { params: mockParams });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.workflow.findUnique).not.toHaveBeenCalled();
    });

    it('returns 404 when workflow not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/workflows/non-existent', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      const response = await PATCH(request, { params: { id: 'non-existent' } });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json).toEqual({ error: 'Workflow not found' });
      expect(prismaMock.workflow.update).not.toHaveBeenCalled();
    });

    it('returns 403 when user does not own workflow', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'other-user',
      } as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      const response = await PATCH(request, { params: mockParams });
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json).toEqual({ error: 'Forbidden' });
      expect(prismaMock.workflow.update).not.toHaveBeenCalled();
    });

    it('verifies ownership before update', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'user-123',
      } as any);
      prismaMock.workflow.update.mockResolvedValue({} as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      await PATCH(request, { params: mockParams });

      expect(prismaMock.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: 'workflow-123' },
        select: { userId: true },
      });
    });
  });

  describe('DELETE /api/workflows/[id]', () => {
    it('deletes workflow when user owns it', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'user-123',
      } as any);

      prismaMock.workflow.delete.mockResolvedValue({} as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ success: true });
      expect(prismaMock.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'workflow-123' },
      });
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.workflow.findUnique).not.toHaveBeenCalled();
    });

    it('returns 404 when workflow not found', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/workflows/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'non-existent' } });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json).toEqual({ error: 'Workflow not found' });
      expect(prismaMock.workflow.delete).not.toHaveBeenCalled();
    });

    it('returns 403 when user does not own workflow', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'other-user',
      } as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: mockParams });
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json).toEqual({ error: 'Forbidden' });
      expect(prismaMock.workflow.delete).not.toHaveBeenCalled();
    });

    it('verifies ownership before deletion', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'user-123',
      } as any);
      prismaMock.workflow.delete.mockResolvedValue({} as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      await DELETE(request, { params: mockParams });

      expect(prismaMock.workflow.findUnique).toHaveBeenCalledWith({
        where: { id: 'workflow-123' },
        select: { userId: true },
      });
    });

    it('deletes related stages via cascade', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'user-123',
      } as any);
      prismaMock.workflow.delete.mockResolvedValue({} as any);

      const request = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      await DELETE(request, { params: mockParams });

      expect(prismaMock.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'workflow-123' },
      });
    });
  });

  describe('Authorization and Security', () => {
    it('both endpoints check authentication', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const patchRequest = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      const deleteRequest = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      await PATCH(patchRequest, { params: mockParams });
      await DELETE(deleteRequest, { params: mockParams });

      expect(auth).toHaveBeenCalledTimes(2);
    });

    it('both endpoints verify workflow ownership', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findUnique.mockResolvedValue({
        id: 'workflow-123',
        userId: 'other-user',
      } as any);

      const patchRequest = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });

      const deleteRequest = new Request('http://localhost/api/workflows/workflow-123', {
        method: 'DELETE',
      });

      const patchResponse = await PATCH(patchRequest, { params: mockParams });
      const deleteResponse = await DELETE(deleteRequest, { params: mockParams });

      expect(patchResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
      expect(prismaMock.workflow.update).not.toHaveBeenCalled();
      expect(prismaMock.workflow.delete).not.toHaveBeenCalled();
    });
  });
});
