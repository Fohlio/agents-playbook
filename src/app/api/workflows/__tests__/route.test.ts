/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/lib/db/__mocks__/client';

jest.mock('@/lib/db/client', () => ({
  prisma: prismaMock,
}));

jest.mock('@/lib/auth/auth', () => ({
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

import { auth } from '@/lib/auth/auth';
import { GET, POST } from '../route';

describe('/api/workflows', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/workflows', () => {
    it('returns user workflows with stage count', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockOwnedWorkflows = [
        {
          id: 'wf-1',
          name: 'Workflow 1',
          description: 'Description 1',
          isActive: true,
          visibility: 'PRIVATE',
          updatedAt: new Date('2024-01-02'),
          _count: { stages: 3 },
        },
      ];

      const mockReferencedWorkflows = [
        {
          id: 'wf-ref-1',
          userId: 'user-123',
          workflowId: 'wf-2',
          workflow: {
            id: 'wf-2',
            name: 'Workflow 2',
            description: null,
            isActive: false,
            visibility: 'PUBLIC',
            updatedAt: new Date('2024-01-01'),
            _count: { stages: 1 },
          },
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(mockOwnedWorkflows as any);
      prismaMock.workflowReference.findMany.mockResolvedValue(mockReferencedWorkflows as any);

      const request = { url: 'http://localhost/api/workflows' } as Request;
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveLength(2);
      expect(json[0].id).toBe('wf-1'); // Most recent first
      expect(json[1].id).toBe('wf-2');
      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          _count: {
            select: { stages: true },
          },
        },
      });
      expect(prismaMock.workflowReference.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          workflow: {
            include: {
              _count: {
                select: { stages: true },
              },
            },
          },
        },
      });
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = { url: 'http://localhost/api/workflows' } as Request;
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.workflow.findMany).not.toHaveBeenCalled();
    });

    it('returns empty array when user has no workflows', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.workflowReference.findMany.mockResolvedValue([]);

      const request = { url: 'http://localhost/api/workflows' } as Request;
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
    });

    it('orders workflows by updatedAt desc', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockOwnedWorkflows = [
        {
          id: 'wf-1',
          updatedAt: new Date('2024-01-01'),
          _count: { stages: 1 },
        },
        {
          id: 'wf-2',
          updatedAt: new Date('2024-01-03'),
          _count: { stages: 1 },
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(mockOwnedWorkflows as any);
      prismaMock.workflowReference.findMany.mockResolvedValue([]);

      const request = { url: 'http://localhost/api/workflows' } as Request;
      const response = await GET(request);
      const json = await response.json();

      expect(json[0].id).toBe('wf-2'); // Most recent first
      expect(json[1].id).toBe('wf-1');
    });

    it('returns system workflows when systemOnly=true', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockSystemWorkflows = [
        {
          id: 'wf-sys-1',
          name: 'System Workflow',
          isSystemWorkflow: true,
          updatedAt: new Date(),
          _count: { stages: 2 },
        },
      ];

      prismaMock.workflow.findMany.mockResolvedValue(mockSystemWorkflows as any);

      const request = { url: 'http://localhost/api/workflows?systemOnly=true' } as Request;
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(mockSystemWorkflows);
      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith({
        where: { isSystemWorkflow: true },
        include: {
          _count: {
            select: { stages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(prismaMock.workflowReference.findMany).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/workflows', () => {
    it('creates a new workflow with provided data', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockCreatedWorkflow = {
        id: 'wf-new',
        name: 'New Workflow',
        description: 'Test description',
        userId: 'user-123',
        yamlContent: null,
        visibility: 'PRIVATE',
        isActive: true,
      };

      prismaMock.workflow.create.mockResolvedValue(mockCreatedWorkflow as any);

      const request = new Request('http://localhost/api/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Workflow',
          description: 'Test description',
          isActive: true,
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(mockCreatedWorkflow);
      expect(prismaMock.workflow.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          name: 'New Workflow',
          description: 'Test description',
          yamlContent: null,
          visibility: 'PRIVATE',
          isActive: true,
        },
      });
    });

    it('creates workflow with default values when fields omitted', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);

      const mockCreatedWorkflow = {
        id: 'wf-new',
        name: 'Untitled Workflow',
        description: null,
        userId: 'user-123',
        yamlContent: null,
        visibility: 'PRIVATE',
        isActive: false,
      };

      prismaMock.workflow.create.mockResolvedValue(mockCreatedWorkflow as any);

      const request = new Request('http://localhost/api/workflows', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(json.name).toBe('Untitled Workflow');
      expect(json.description).toBeNull();
      expect(json.isActive).toBe(false);
    });

    it('returns 401 when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
      expect(prismaMock.workflow.create).not.toHaveBeenCalled();
    });

    it('sets visibility to PRIVATE by default', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.create.mockResolvedValue({ id: 'wf-new' } as any);

      const request = new Request('http://localhost/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      await POST(request);

      expect(prismaMock.workflow.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: 'PRIVATE',
          }),
        })
      );
    });

    it('associates workflow with authenticated user', async () => {
      (auth as jest.Mock).mockResolvedValue(mockSession);
      prismaMock.workflow.create.mockResolvedValue({ id: 'wf-new' } as any);

      const request = new Request('http://localhost/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      await POST(request);

      expect(prismaMock.workflow.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      );
    });
  });
});
