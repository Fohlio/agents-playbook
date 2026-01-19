import { Visibility, Workflow, MiniPrompt } from '@prisma/client';

/**
 * Folder Types for Library File System
 *
 * These types support the file-system-like Library interface
 * with folder organization, trash management, and multi-folder membership.
 */

export type FolderTargetType = 'WORKFLOW' | 'MINI_PROMPT';

export interface FolderWithItems {
  id: string;
  name: string;
  key: string | null;
  description: string | null;
  visibility: Visibility;
  position: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
}

export interface FolderBasic {
  id: string;
  name: string;
  key: string | null;
  description: string | null;
  visibility: Visibility;
  position: number;
}

export interface FolderContents {
  workflows: WorkflowWithMeta[];
  prompts: PromptWithMeta[];
}

export interface WorkflowWithMeta extends Pick<
  Workflow,
  'id' | 'name' | 'description' | 'visibility' | 'isActive' | 'createdAt' | 'updatedAt' | 'key'
> {
  user: {
    id: string;
    username: string;
    email: string;
  };
  _count: {
    stages: number;
  };
  folderPosition: number;
}

export interface PromptWithMeta extends Pick<
  MiniPrompt,
  'id' | 'name' | 'description' | 'content' | 'visibility' | 'isActive' | 'createdAt' | 'updatedAt' | 'key'
> {
  user: {
    id: string;
    username: string;
    email: string;
  };
  folderPosition: number;
  isStandalone: boolean;
}

export interface TrashedItem {
  id: string;
  name: string;
  type: FolderTargetType;
  deletedAt: Date;
  description: string | null;
}

export interface CreateFolderInput {
  name: string;
  description?: string | null;
  visibility?: Visibility;
  key?: string;
}

export interface UpdateFolderInput {
  name?: string;
  description?: string | null;
  visibility?: Visibility;
  key?: string;
  position?: number;
}

export interface AddItemToFolderInput {
  folderId: string;
  targetType: FolderTargetType;
  targetId: string;
  position?: number;
}

export interface FolderServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UncategorizedItems {
  workflows: WorkflowWithMeta[];
  prompts: PromptWithMeta[];
}
