/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from '@/server/db/__mocks__/client';
import { createFolderHandler } from '../create-folder-handler';

jest.mock('@/server/db/client', () => ({
  prisma: prismaMock,
}));

describe('MCP Tool: create_folder', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authentication', () => {
    it('requires authentication', async () => {
      const result = await createFolderHandler({ name: 'Test Folder' }, null);

      expect(result.content[0].text).toContain('Authentication required');
    });

    it('allows authenticated users to create folders', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Test Folder',
        key: 'test-folder',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler({ name: 'Test Folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.message).toBe('Folder created successfully');
      expect(data.folder.name).toBe('Test Folder');
    });
  });

  describe('folder creation', () => {
    it('creates folder with name only', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'My Folder',
        key: 'my-folder',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler({ name: 'My Folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.folder).toEqual({
        id: 'folder-1',
        name: 'My Folder',
        key: 'my-folder',
        visibility: 'PRIVATE',
        description: null,
      });
    });

    it('creates folder with description', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Project Files',
        key: 'project-files',
        description: 'All project related files',
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler(
        {
          name: 'Project Files',
          description: 'All project related files',
        },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.description).toBe('All project related files');
    });

    it('creates folder with custom visibility', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Public Folder',
        key: 'public-folder',
        description: null,
        visibility: 'PUBLIC',
      } as any);

      const result = await createFolderHandler(
        {
          name: 'Public Folder',
          visibility: 'PUBLIC',
        },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.visibility).toBe('PUBLIC');
    });

    it('creates folder with custom key', async () => {
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'My Folder',
        key: 'custom-key-123',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler(
        {
          name: 'My Folder',
          key: 'custom-key-123',
        },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.key).toBe('custom-key-123');
    });

    it('creates folder with all options', async () => {
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: 2 } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Complete Folder',
        key: 'complete-folder',
        description: 'Full description',
        visibility: 'PUBLIC',
      } as any);

      const result = await createFolderHandler(
        {
          name: 'Complete Folder',
          description: 'Full description',
          visibility: 'PUBLIC',
          key: 'complete-folder',
        },
        mockUserId
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.folder).toEqual({
        id: 'folder-1',
        name: 'Complete Folder',
        key: 'complete-folder',
        description: 'Full description',
        visibility: 'PUBLIC',
      });
    });
  });

  describe('validation', () => {
    it('requires name to be provided', async () => {
      const result = await createFolderHandler({ name: '' }, mockUserId);

      expect(result.content[0].text).toContain('name is required');
    });

    it('requires name to not be whitespace only', async () => {
      const result = await createFolderHandler({ name: '   ' }, mockUserId);

      expect(result.content[0].text).toContain('name is required');
    });

    it('trims whitespace from name', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Trimmed Name',
        key: 'trimmed-name',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      await createFolderHandler({ name: '  Trimmed Name  ' }, mockUserId);

      // Verify the trimmed name was passed to create
      expect(prismaMock.folders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Trimmed Name',
          }),
        })
      );
    });

    it('trims whitespace from description', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Test',
        key: 'test',
        description: 'Trimmed description',
        visibility: 'PRIVATE',
      } as any);

      await createFolderHandler(
        { name: 'Test', description: '  Trimmed description  ' },
        mockUserId
      );

      // Verify the trimmed description was passed
      expect(prismaMock.folders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'Trimmed description',
          }),
        })
      );
    });

    it('trims whitespace from key', async () => {
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Test',
        key: 'custom-key',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      await createFolderHandler(
        { name: 'Test', key: '  custom-key  ' },
        mockUserId
      );

      // Verify the trimmed key was passed
      expect(prismaMock.folders.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            key: 'custom-key',
          }),
        })
      );
    });
  });

  describe('key generation', () => {
    it('auto-generates key from name when not provided', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'My Test Folder',
        key: 'my-test-folder',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler({ name: 'My Test Folder' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.key).toBe('my-test-folder');
    });
  });

  describe('default values', () => {
    it('defaults visibility to PRIVATE', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Test',
        key: 'test',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler({ name: 'Test' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.visibility).toBe('PRIVATE');
    });

    it('defaults description to null when not provided', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Test',
        key: 'test',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler({ name: 'Test' }, mockUserId);

      const data = JSON.parse(result.content[0].text);
      expect(data.folder.description).toBeNull();
    });
  });

  describe('error handling', () => {
    it('handles database errors gracefully', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockRejectedValue(new Error('DB Error'));

      const result = await createFolderHandler({ name: 'Test' }, mockUserId);

      expect(result.content[0].text).toContain('Failed to create folder');
    });

    it('handles folder service errors', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockRejectedValue(new Error('Position Error'));

      const result = await createFolderHandler({ name: 'Test' }, mockUserId);

      expect(result.content[0].text).toContain('Failed to create folder');
    });
  });

  describe('response format', () => {
    it('returns MCP-formatted success response', async () => {
      prismaMock.folders.findUnique.mockResolvedValue(null);
      prismaMock.folders.aggregate.mockResolvedValue({ _max: { position: null } } as any);
      prismaMock.folders.create.mockResolvedValue({
        id: 'folder-1',
        name: 'Test',
        key: 'test',
        description: null,
        visibility: 'PRIVATE',
      } as any);

      const result = await createFolderHandler({ name: 'Test' }, mockUserId);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data.message).toBe('Folder created successfully');
      expect(data.folder).toBeDefined();
    });

    it('returns MCP-formatted error response', async () => {
      const result = await createFolderHandler({ name: '' }, mockUserId);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Error:');
    });
  });
});
