/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/server/db/__mocks__/client';
import {
  generateFolderKey,
  getUserFolders,
  getFolderById,
  getFolderByKey,
  getUncategorizedItems,
  getTrashedItems,
  getFolderContents,
  createFolder,
  updateFolder,
  deleteFolder,
  addItemToFolder,
  removeItemFromFolder,
  moveItemToTrash,
  restoreFromTrash,
  permanentDelete,
  moveItemBetweenFolders,
  bulkAddToFolder,
  bulkMoveToTrash,
} from '../folder-service';

jest.mock('@/server/db/client', () => ({
  prisma: prismaMock,
}));

// Mock randomUUID - returns a proper UUID format
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
}));

describe('Folder Service', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFolderKey', () => {
    it('should generate a slug from folder name', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);

      const key = await generateFolderKey('My Test Folder', mockUserId);

      expect(key).toBe('my-test-folder');
    });

    it('should handle special characters in name', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);

      const key = await generateFolderKey('Test!@#$%^&*()Folder', mockUserId);

      expect(key).toBe('test-folder');
    });

    it('should truncate long names to 80 characters', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);

      const longName = 'a'.repeat(100);
      const key = await generateFolderKey(longName, mockUserId);

      expect(key.length).toBeLessThanOrEqual(80);
    });

    it('should add suffix if key already exists', async () => {
      prismaMock.folders.findUnique.mockResolvedValueOnce({
        id: 'existing-folder',
        key: 'my-folder',
      } as any);

      const key = await generateFolderKey('My Folder', mockUserId);

      expect(key).toMatch(/^my-folder-[a-f0-9]{8}$/);
    });

    it('should remove leading and trailing hyphens', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);

      const key = await generateFolderKey('---Test---', mockUserId);

      expect(key).toBe('test');
    });
  });

  describe('getUserFolders', () => {
    it('should return folders for user', async () => {
      const mockFolders = [
        {
          id: 'folder-1',
          name: 'Folder 1',
          key: 'folder-1',
          description: 'Description 1',
          visibility: 'PRIVATE',
          position: 0,
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
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
          created_at: new Date(),
          updated_at: new Date(),
          _count: { folder_items: 3 },
        },
      ];

      prismaMock.folders.findMany.mockResolvedValue(mockFolders as any);

      const result = await getUserFolders(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].itemCount).toBe(5);
      expect(result.data![1].itemCount).toBe(3);
    });

    it('should filter out deleted folders', async () => {
      prismaMock.folders.findMany.mockResolvedValue([]);

      await getUserFolders(mockUserId);

      expect(prismaMock.folders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUserId,
            is_active: true,
            deleted_at: null,
          }),
        })
      );
    });

    it('should order folders by position', async () => {
      prismaMock.folders.findMany.mockResolvedValue([]);

      await getUserFolders(mockUserId);

      expect(prismaMock.folders.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { position: 'asc' },
        })
      );
    });

    it('should return error on database failure', async () => {
      prismaMock.folders.findMany.mockRejectedValue(new Error('DB Error'));

      const result = await getUserFolders(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch folders');
    });
  });

  describe('getFolderById', () => {
    it('should return folder when found', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        description: 'Test description',
        visibility: 'PRIVATE',
        position: 0,
      };

      prismaMock.folders.findFirst.mockResolvedValue(mockFolder as any);

      const result = await getFolderById('folder-1', mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFolder);
    });

    it('should return error when folder not found', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const result = await getFolderById('non-existent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });

    it('should verify user ownership', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      await getFolderById('folder-1', mockUserId);

      expect(prismaMock.folders.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'folder-1',
            user_id: mockUserId,
          }),
        })
      );
    });
  });

  describe('getFolderByKey', () => {
    it('should return folder for public access', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Public Folder',
        key: 'public-folder',
        description: null,
        visibility: 'PUBLIC',
        position: 0,
        deleted_at: null,
        user_id: 'other-user',
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getFolderByKey('public-folder');

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Public Folder');
    });

    it('should deny access to private folder for non-owner', async () => {
      const mockFolder = {
        id: 'folder-1',
        visibility: 'PRIVATE',
        user_id: 'other-user',
        deleted_at: null,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getFolderByKey('private-folder', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });

    it('should allow owner access to private folder', async () => {
      const mockFolder = {
        id: 'folder-1',
        name: 'Private Folder',
        key: 'private-folder',
        description: null,
        visibility: 'PRIVATE',
        position: 0,
        deleted_at: null,
        user_id: mockUserId,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getFolderByKey('private-folder', mockUserId);

      expect(result.success).toBe(true);
    });

    it('should return error for deleted folder', async () => {
      const mockFolder = {
        id: 'folder-1',
        visibility: 'PUBLIC',
        deleted_at: new Date(),
        user_id: mockUserId,
      };

      prismaMock.folders.findUnique.mockResolvedValue(mockFolder as any);

      const result = await getFolderByKey('deleted-folder');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });
  });

  describe('getUncategorizedItems', () => {
    it('should return items not in any folder', async () => {
      // Mock folder_items - no items in folders
      prismaMock.folder_items.findMany.mockResolvedValue([]);

      // Mock stageMiniPrompt - no prompts in workflows
      prismaMock.stageMiniPrompt.findMany.mockResolvedValue([]);

      // Mock workflows
      const mockWorkflows = [
        {
          id: 'wf-1',
          name: 'Workflow 1',
          description: 'Test workflow',
          visibility: 'PRIVATE',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          key: 'workflow-1',
          user: { id: mockUserId, username: 'testuser', email: 'test@test.com' },
          _count: { stages: 2 },
        },
      ];
      prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as any);

      // Mock prompts
      const mockPrompts = [
        {
          id: 'prompt-1',
          name: 'Prompt 1',
          description: 'Test prompt',
          content: 'Content',
          visibility: 'PRIVATE',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          key: 'prompt-1',
          user: { id: mockUserId, username: 'testuser', email: 'test@test.com' },
        },
      ];
      prismaMock.miniPrompt.findMany.mockResolvedValue(mockPrompts as any);

      const result = await getUncategorizedItems(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.workflows).toHaveLength(1);
      expect(result.data?.prompts).toHaveLength(1);
    });

    it('should exclude items that are in folders', async () => {
      // Mock folder_items - workflow is in a folder
      prismaMock.folder_items.findMany
        .mockResolvedValueOnce([{ target_id: 'wf-1' }] as any) // workflows
        .mockResolvedValueOnce([] as any); // prompts

      prismaMock.stageMiniPrompt.findMany.mockResolvedValue([]);

      const mockWorkflows = [
        {
          id: 'wf-1',
          name: 'In Folder',
          user: { id: mockUserId, username: 'user', email: 'test@test.com' },
          _count: { stages: 1 },
        },
        {
          id: 'wf-2',
          name: 'Uncategorized',
          user: { id: mockUserId, username: 'user', email: 'test@test.com' },
          _count: { stages: 1 },
        },
      ];
      prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as any);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getUncategorizedItems(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.workflows).toHaveLength(1);
      expect(result.data?.workflows[0].id).toBe('wf-2');
    });

    it('should exclude prompts that are part of workflows', async () => {
      prismaMock.folder_items.findMany.mockResolvedValue([]);

      // Mock - prompt is part of workflow stage
      prismaMock.stageMiniPrompt.findMany.mockResolvedValue([
        { miniPromptId: 'prompt-1' },
      ] as any);

      prismaMock.workflow.findMany.mockResolvedValue([]);

      const mockPrompts = [
        {
          id: 'prompt-1',
          name: 'Workflow Prompt',
          user: { id: mockUserId, username: 'user', email: 'test@test.com' },
        },
        {
          id: 'prompt-2',
          name: 'Standalone Prompt',
          user: { id: mockUserId, username: 'user', email: 'test@test.com' },
        },
      ];
      prismaMock.miniPrompt.findMany.mockResolvedValue(mockPrompts as any);

      const result = await getUncategorizedItems(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.prompts).toHaveLength(1);
      expect(result.data?.prompts[0].id).toBe('prompt-2');
    });
  });

  describe('getTrashedItems', () => {
    it('should return trashed workflows and prompts', async () => {
      const deletedAt = new Date();

      prismaMock.workflow.findMany.mockResolvedValue([
        {
          id: 'wf-1',
          name: 'Trashed Workflow',
          description: 'Deleted',
          deletedAt,
        },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([
        {
          id: 'prompt-1',
          name: 'Trashed Prompt',
          description: 'Also deleted',
          deletedAt,
        },
      ] as any);

      const result = await getTrashedItems(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].type).toBe('WORKFLOW');
      expect(result.data![1].type).toBe('MINI_PROMPT');
    });

    it('should filter by userId and deletedAt not null', async () => {
      prismaMock.workflow.findMany.mockResolvedValue([]);
      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      await getTrashedItems(mockUserId);

      expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            deletedAt: { not: null },
          },
        })
      );

      expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: mockUserId,
            deletedAt: { not: null },
          },
        })
      );
    });

    it('should sort items by deletedAt descending', async () => {
      const olderDate = new Date('2024-01-01');
      const newerDate = new Date('2024-01-15');

      prismaMock.workflow.findMany.mockResolvedValue([
        { id: 'wf-1', name: 'Older', deletedAt: olderDate },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([
        { id: 'prompt-1', name: 'Newer', deletedAt: newerDate },
      ] as any);

      const result = await getTrashedItems(mockUserId);

      expect(result.data![0].name).toBe('Newer');
      expect(result.data![1].name).toBe('Older');
    });
  });

  describe('getFolderContents', () => {
    it('should return workflows and prompts in folder', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.folder_items.findMany.mockResolvedValue([
        { target_type: 'WORKFLOW', target_id: 'wf-1', position: 0 },
        { target_type: 'MINI_PROMPT', target_id: 'prompt-1', position: 1 },
      ] as any);

      prismaMock.stageMiniPrompt.findMany.mockResolvedValue([]);

      prismaMock.workflow.findMany.mockResolvedValue([
        {
          id: 'wf-1',
          name: 'Workflow',
          user: { id: mockUserId, username: 'user', email: 'test@test.com' },
          _count: { stages: 1 },
        },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([
        {
          id: 'prompt-1',
          name: 'Prompt',
          user: { id: mockUserId, username: 'user', email: 'test@test.com' },
        },
      ] as any);

      const result = await getFolderContents('folder-1', mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.workflows).toHaveLength(1);
      expect(result.data?.prompts).toHaveLength(1);
    });

    it('should return error for non-existent folder', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const result = await getFolderContents('non-existent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });

    it('should sort items by position', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.folder_items.findMany.mockResolvedValue([
        { target_type: 'WORKFLOW', target_id: 'wf-2', position: 1 },
        { target_type: 'WORKFLOW', target_id: 'wf-1', position: 0 },
      ] as any);

      prismaMock.stageMiniPrompt.findMany.mockResolvedValue([]);

      prismaMock.workflow.findMany.mockResolvedValue([
        { id: 'wf-1', name: 'First', user: { id: mockUserId, username: 'user', email: 'test@test.com' }, _count: { stages: 0 } },
        { id: 'wf-2', name: 'Second', user: { id: mockUserId, username: 'user', email: 'test@test.com' }, _count: { stages: 0 } },
      ] as any);

      prismaMock.miniPrompt.findMany.mockResolvedValue([]);

      const result = await getFolderContents('folder-1', mockUserId);

      expect(result.data?.workflows).toHaveLength(2);
      expect(result.data?.workflows[0].id).toBe('wf-1');
      expect(result.data?.workflows[1].id).toBe('wf-2');
    });
  });

  describe('createFolder', () => {
    it('should create folder with auto-generated key', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: 2 } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'new-folder-id',
        name: 'New Folder',
        key: 'new-folder',
        description: null,
        visibility: 'PRIVATE',
        position: 3,
      } as any);

      const result = await createFolder({ name: 'New Folder' }, mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('New Folder');
      expect(result.data?.position).toBe(3);
    });

    it('should create folder with custom key', async () => {
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'new-folder-id',
        name: 'Custom Folder',
        key: 'my-custom-key',
        description: 'Test',
        visibility: 'PUBLIC',
        position: 0,
      } as any);

      const result = await createFolder(
        { name: 'Custom Folder', key: 'my-custom-key', visibility: 'PUBLIC', description: 'Test' },
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('my-custom-key');
      expect(result.data?.visibility).toBe('PUBLIC');
    });

    it('should set position to 0 if no folders exist', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-id',
        position: 0,
      } as any);

      await createFolder({ name: 'First Folder' }, mockUserId);

      expect(prismaMock.folders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            position: 0,
          }),
        })
      );
    });
  });

  describe('updateFolder', () => {
    it('should update folder name', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        deleted_at: null,
      } as any);

      prismaMock.folders.update.mockResolvedValue({
        id: 'folder-1',
        name: 'Updated Name',
        key: 'folder-1',
        description: null,
        visibility: 'PRIVATE',
        position: 0,
      } as any);

      const result = await updateFolder('folder-1', { name: 'Updated Name' }, mockUserId);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Name');
    });

    it('should return error if folder not found', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const result = await updateFolder('non-existent', { name: 'Test' }, mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });

    it('should only update provided fields', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        deleted_at: null,
      } as any);

      prismaMock.folders.update.mockResolvedValue({ id: 'folder-1' } as any);

      await updateFolder('folder-1', { visibility: 'PUBLIC' }, mockUserId);

      expect(prismaMock.folders.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: 'PUBLIC',
          }),
        })
      );
    });
  });

  describe('deleteFolder', () => {
    it('should soft delete folder and remove folder items', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        deleted_at: null,
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const result = await deleteFolder('folder-1', mockUserId);

      expect(result.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should return error if folder not found', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const result = await deleteFolder('non-existent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });
  });

  describe('addItemToFolder', () => {
    it('should add workflow to folder', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);

      prismaMock.folder_items.findFirst.mockResolvedValue(null);
      prismaMock.folder_items.aggregate.mockResolvedValue({ _max: { position: 0 } } as any);
      prismaMock.folder_items.create.mockResolvedValue({} as any);

      const result = await addItemToFolder('folder-1', 'WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(true);
    });

    it('should add prompt to folder', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);

      prismaMock.folder_items.findFirst.mockResolvedValue(null);
      prismaMock.folder_items.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folder_items.create.mockResolvedValue({} as any);

      const result = await addItemToFolder('folder-1', 'MINI_PROMPT', 'prompt-1', mockUserId);

      expect(result.success).toBe(true);
    });

    it('should return error if folder not found', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const result = await addItemToFolder('non-existent', 'WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });

    it('should return error if workflow not found', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.workflow.findFirst.mockResolvedValue(null);

      const result = await addItemToFolder('folder-1', 'WORKFLOW', 'non-existent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow not found');
    });

    it('should return success if item already in folder (no-op)', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);

      prismaMock.folder_items.findFirst.mockResolvedValue({
        id: 'existing-item',
      } as any);

      const result = await addItemToFolder('folder-1', 'WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(true);
      expect(prismaMock.folder_items.create).not.toHaveBeenCalled();
    });

    it('should set custom position if provided', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);

      prismaMock.folder_items.findFirst.mockResolvedValue(null);
      prismaMock.folder_items.create.mockResolvedValue({} as any);

      await addItemToFolder('folder-1', 'WORKFLOW', 'wf-1', mockUserId, 5);

      expect(prismaMock.folder_items.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            position: 5,
          }),
        })
      );
    });
  });

  describe('removeItemFromFolder', () => {
    it('should remove item from folder', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
      } as any);

      prismaMock.folder_items.deleteMany.mockResolvedValue({ count: 1 } as any);

      const result = await removeItemFromFolder('folder-1', 'WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(true);
      expect(prismaMock.folder_items.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            folder_id: 'folder-1',
            target_type: 'WORKFLOW',
            target_id: 'wf-1',
          },
        })
      );
    });

    it('should return error if folder not found', async () => {
      prismaMock.folders.findFirst.mockResolvedValue(null);

      const result = await removeItemFromFolder('non-existent', 'WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Folder not found');
    });
  });

  describe('moveItemToTrash', () => {
    it('should soft delete workflow and remove from folders', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const result = await moveItemToTrash('WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('should soft delete prompt and remove from folders', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        userId: mockUserId,
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const result = await moveItemToTrash('MINI_PROMPT', 'prompt-1', mockUserId);

      expect(result.success).toBe(true);
    });

    it('should return error if workflow not found', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      const result = await moveItemToTrash('WORKFLOW', 'non-existent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow not found');
    });

    it('should return error if prompt not found', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue(null);

      const result = await moveItemToTrash('MINI_PROMPT', 'non-existent', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Prompt not found');
    });
  });

  describe('restoreFromTrash', () => {
    it('should restore workflow by clearing deletedAt', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: new Date(),
      } as any);

      prismaMock.workflow.update.mockResolvedValue({} as any);

      const result = await restoreFromTrash('WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(true);
      expect(prismaMock.workflow.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { deletedAt: null },
        })
      );
    });

    it('should restore prompt by clearing deletedAt', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        userId: mockUserId,
        deletedAt: new Date(),
      } as any);

      prismaMock.miniPrompt.update.mockResolvedValue({} as any);

      const result = await restoreFromTrash('MINI_PROMPT', 'prompt-1', mockUserId);

      expect(result.success).toBe(true);
    });

    it('should return error if workflow not in trash', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      const result = await restoreFromTrash('WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow not found in trash');
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete trashed workflow', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: new Date(),
      } as any);

      prismaMock.workflow.delete.mockResolvedValue({} as any);

      const result = await permanentDelete('WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(true);
      expect(prismaMock.workflow.delete).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
      });
    });

    it('should permanently delete trashed prompt', async () => {
      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        userId: mockUserId,
        deletedAt: new Date(),
      } as any);

      prismaMock.miniPrompt.delete.mockResolvedValue({} as any);

      const result = await permanentDelete('MINI_PROMPT', 'prompt-1', mockUserId);

      expect(result.success).toBe(true);
    });

    it('should return error if item not in trash', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue(null);

      const result = await permanentDelete('WORKFLOW', 'wf-1', mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Workflow not found in trash');
    });
  });

  describe('moveItemBetweenFolders', () => {
    it('should move item from source to target folder', async () => {
      // Mock removeItemFromFolder success
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'source-folder',
        user_id: mockUserId,
      } as any);
      prismaMock.folder_items.deleteMany.mockResolvedValue({ count: 1 } as any);

      // Mock addItemToFolder success
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'target-folder',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);
      prismaMock.folder_items.findFirst.mockResolvedValue(null);
      prismaMock.folder_items.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folder_items.create.mockResolvedValue({} as any);

      const result = await moveItemBetweenFolders(
        'source-folder',
        'target-folder',
        'WORKFLOW',
        'wf-1',
        mockUserId
      );

      expect(result.success).toBe(true);
    });
  });

  describe('bulkAddToFolder', () => {
    it('should add multiple items to folder', async () => {
      prismaMock.folders.findFirst.mockResolvedValue({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);

      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);

      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        userId: mockUserId,
        deletedAt: null,
      } as any);

      prismaMock.folder_items.findFirst.mockResolvedValue(null);
      prismaMock.folder_items.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folder_items.create.mockResolvedValue({} as any);

      const result = await bulkAddToFolder(
        'folder-1',
        [
          { targetType: 'WORKFLOW', targetId: 'wf-1' },
          { targetType: 'MINI_PROMPT', targetId: 'prompt-1' },
        ],
        mockUserId
      );

      expect(result.success).toBe(true);
    });

    it('should continue even if individual items fail', async () => {
      // First item - folder not found
      prismaMock.folders.findFirst.mockResolvedValueOnce(null);

      // Second item - success
      prismaMock.folders.findFirst.mockResolvedValueOnce({
        id: 'folder-1',
        user_id: mockUserId,
        is_active: true,
        deleted_at: null,
      } as any);
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-2',
        userId: mockUserId,
        deletedAt: null,
      } as any);
      prismaMock.folder_items.findFirst.mockResolvedValue(null);
      prismaMock.folder_items.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folder_items.create.mockResolvedValue({} as any);

      const result = await bulkAddToFolder(
        'folder-1',
        [
          { targetType: 'WORKFLOW', targetId: 'wf-1' },
          { targetType: 'WORKFLOW', targetId: 'wf-2' },
        ],
        mockUserId
      );

      // Should still return success even if some items failed
      expect(result.success).toBe(true);
    });
  });

  describe('bulkMoveToTrash', () => {
    it('should move multiple items to trash', async () => {
      prismaMock.workflow.findFirst.mockResolvedValue({
        id: 'wf-1',
        userId: mockUserId,
      } as any);

      prismaMock.miniPrompt.findFirst.mockResolvedValue({
        id: 'prompt-1',
        userId: mockUserId,
      } as any);

      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const result = await bulkMoveToTrash(
        [
          { targetType: 'WORKFLOW', targetId: 'wf-1' },
          { targetType: 'MINI_PROMPT', targetId: 'prompt-1' },
        ],
        mockUserId
      );

      expect(result.success).toBe(true);
    });
  });
});
