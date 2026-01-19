/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/server/db/__mocks__/client';
import { getByFolderHandler } from '../get-by-folder-handler';

jest.mock('@/server/db/client', () => ({
  prisma: prismaMock,
}));

describe('MCP Tool: get_by_folder', () => {
  const mockUserId = 'user-123';
  const mockOtherUserId = 'user-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful retrieval', () => {
    it('returns public folder contents without authentication', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Public Folder',
        key: 'public-folder',
        visibility: 'PUBLIC',
        user_id: mockOtherUserId,
        deleted_at: null,
      };

      const mockFolderItems = [
        { target_type: 'WORKFLOW', target_id: 'wf-1', position: 0 },
        { target_type: 'MINI_PROMPT', target_id: 'prompt-1', position: 1 },
      ];

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue(mockFolderItems as any);
      prismaMock.folder_items.count.mockResolvedValue(2);

      prismaMock.workflow.findMany.mockResolvedValue([
        { id: 'wf-1', name: 'Workflow 1', description: 'Desc' },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([
        { id: 'prompt-1', name: 'Prompt 1', description: null, content: 'Content' },
      ] as any);

      const result = await getByFolderHandler({ folder_key: 'public-folder' }, null);

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);

      expect(data.folder.name).toBe('Public Folder');
      expect(data.items).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
    });

    it('returns private folder contents for owner', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Private Folder',
        key: 'private-folder',
        visibility: 'PRIVATE',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue([]);
      prismaMock.folder_items.count.mockResolvedValue(0);
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler({ folder_key: 'private-folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.name).toBe('Private Folder');
    });

    it('includes workflow details in response', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      const mockFolderItems = [
        { target_type: 'WORKFLOW', target_id: 'wf-1', position: 0 },
      ];

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue(mockFolderItems as any);
      prismaMock.folder_items.count.mockResolvedValue(1);

      prismaMock.workflow.findMany.mockResolvedValue([
        { id: 'wf-1', name: 'My Workflow', description: 'A workflow description' },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.items[0]).toEqual({
        type: 'WORKFLOW',
        id: 'wf-1',
        name: 'My Workflow',
        description: 'A workflow description',
        position: 0,
      });
    });

    it('includes prompt details with content in response', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      const mockFolderItems = [
        { target_type: 'MINI_PROMPT', target_id: 'prompt-1', position: 0 },
      ];

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue(mockFolderItems as any);
      prismaMock.folder_items.count.mockResolvedValue(1);

      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([
        { id: 'prompt-1', name: 'My Prompt', description: 'Desc', content: 'Prompt content here' },
      ] as any);

      const result = await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.items[0]).toEqual({
        type: 'MINI_PROMPT',
        id: 'prompt-1',
        name: 'My Prompt',
        description: 'Desc',
        content: 'Prompt content here',
        position: 0,
      });
    });
  });

  describe('pagination', () => {
    it('returns correct pagination metadata', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue([]);
      prismaMock.folder_items.count.mockResolvedValue(50);
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler(
        { folder_key: 'test-folder', page: 1, limit: 20 },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 50,
        hasMore: true,
      });
    });

    it('calculates hasMore correctly when on last page', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue([]);
      prismaMock.folder_items.count.mockResolvedValue(15);
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler(
        { folder_key: 'test-folder', page: 1, limit: 20 },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.pagination.hasMore).toBe(false);
    });

    it('clamps limit to max 100', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue([]);
      prismaMock.folder_items.count.mockResolvedValue(0);
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler(
        { folder_key: 'test-folder', limit: 500 },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.pagination.limit).toBe(100);
    });

    it('uses default values for page and limit', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue([]);
      prismaMock.folder_items.count.mockResolvedValue(0);
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
    });
  });

  describe('access control', () => {
    it('denies access to private folder for non-owner', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Private Folder',
        key: 'private-folder',
        visibility: 'PRIVATE',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getByFolderHandler(
        { folder_key: 'private-folder' },
        mockOtherUserId
      );

      expect(result.content[0].text).toContain('Access denied');
    });

    it('denies access to private folder for unauthenticated user', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Private Folder',
        key: 'private-folder',
        visibility: 'PRIVATE',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getByFolderHandler({ folder_key: 'private-folder' }, null);

      expect(result.content[0].text).toContain('Access denied');
    });
  });

  describe('error handling', () => {
    it('returns error when folder not found', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);

      const result = await getByFolderHandler({ folder_key: 'non-existent' }, mockUserId);

      expect(result.content[0].text).toContain('Folder not found');
    });

    it('returns error when folder is deleted', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Deleted Folder',
        key: 'deleted-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: new Date(),
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getByFolderHandler({ folder_key: 'deleted-folder' }, mockUserId);

      expect(result.content[0].text).toContain('Folder not found');
    });

    it('handles database errors gracefully', async () => {
      prismaMock.folders.findUnique.mockRejectedValue(new Error('DB Error'));

      const result = await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      expect(result.content[0].text).toContain('Failed to get folder contents');
    });
  });

  describe('item filtering', () => {
    it('excludes deleted workflows from results', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      const mockFolderItems = [
        { target_type: 'WORKFLOW', target_id: 'wf-1', position: 0 },
        { target_type: 'WORKFLOW', target_id: 'wf-2', position: 1 }, // This one is deleted
      ];

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue(mockFolderItems as any);
      prismaMock.folder_items.count.mockResolvedValue(2);

      // Only return wf-1, wf-2 is filtered out due to deletedAt
      prismaMock.workflow.findMany.mockResolvedValue([
        { id: 'wf-1', name: 'Active Workflow', description: null },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].id).toBe('wf-1');
    });

    it('excludes prompts that are part of workflows', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue([
        { target_type: 'MINI_PROMPT', target_id: 'prompt-1', position: 0 },
      ] as any);
      prismaMock.folder_items.count.mockResolvedValue(1);

      prismaMock.workflow.findMany.mockResolvedValue([]);

      // The query should use stageMiniPrompts: { none: {} } to filter
      prismaMock.miniPrompt.findMany.mockResolvedValue([
        { id: 'prompt-1', name: 'Standalone Prompt', description: null, content: 'Content' },
      ] as any);

      await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stageMiniPrompts: { none: {} },
          }),
        })
      );
    });
  });

  describe('ordering', () => {
    it('maintains position order from folder_items', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        visibility: 'PUBLIC',
        user_id: mockUserId,
        deleted_at: null,
      };

      const mockFolderItems = [
        { target_type: 'WORKFLOW', target_id: 'wf-2', position: 0 },
        { target_type: 'WORKFLOW', target_id: 'wf-1', position: 1 },
      ];

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);
      prismaMock.folder_items.findMany.mockResolvedValue(mockFolderItems as any);
      prismaMock.folder_items.count.mockResolvedValue(2);

      // Workflows returned in different order
      prismaMock.workflow.findMany.mockResolvedValue([
        { id: 'wf-1', name: 'Workflow 1', description: null },
        { id: 'wf-2', name: 'Workflow 2', description: null },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getByFolderHandler({ folder_key: 'test-folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      // Should be ordered by position from folder_items
      expect(data.items[0].id).toBe('wf-2');
      expect(data.items[1].id).toBe('wf-1');
    });
  });
});
