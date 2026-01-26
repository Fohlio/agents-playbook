import { Skill, Visibility } from '@prisma/client';

export interface SkillBasic extends Pick<
  Skill,
  'id' | 'name' | 'description' | 'visibility' | 'isActive' | 'createdAt' | 'updatedAt' | 'key' | 'position'
> {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface SkillWithMeta extends SkillBasic {
  isOwned: boolean;
  referenceId: string | null;
  isSystemSkill: boolean;
  tags: Array<{ tagId: string; tag: { id: string; name: string; color: string | null } }>;
  averageRating: number | null;
  totalRatings: number;
  usageCount: number;
  attachmentCount: number;
}

export interface SkillDetail extends SkillBasic {
  content: string;
  isSystemSkill: boolean;
  tags: Array<{ tagId: string; tag: { id: string; name: string; color: string | null } }>;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
  }>;
}

export interface CreateSkillInput {
  name: string;
  content: string;
  description?: string | null;
  visibility?: Visibility;
  tagIds?: string[];
  newTagNames?: string[];
  key?: string;
  isSystemSkill?: boolean;
}

export interface UpdateSkillInput {
  name?: string;
  content?: string;
  description?: string | null;
  visibility?: Visibility;
  isActive?: boolean;
  tagIds?: string[];
  newTagNames?: string[];
  key?: string;
  modelIds?: string[];
}
