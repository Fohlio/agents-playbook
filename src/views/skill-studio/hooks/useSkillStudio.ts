'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface SkillAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt?: string;
}

export interface SkillInitialData {
  id: string;
  name: string;
  description?: string | null;
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  tagIds?: string[];
  modelIds?: string[];
  attachments?: SkillAttachment[];
}

interface UseSkillStudioOptions {
  initialData?: SkillInitialData | null;
  onSaveSuccess?: (skillId: string) => void;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Extract error message from unknown error */
function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Parse API error response */
async function parseApiError(response: Response, fallback: string): Promise<string> {
  const data = await response.json().catch(() => ({}));
  return data.error || fallback;
}

/** Remove a key from a record, returning a new object */
function omitKey<T>(obj: Record<string, T>, key: string): Record<string, T> {
  const result = { ...obj };
  delete result[key];
  return result;
}

interface UseSkillStudioReturn {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  content: string;
  setContent: (content: string) => void;
  visibility: 'PUBLIC' | 'PRIVATE';
  setVisibility: (vis: 'PUBLIC' | 'PRIVATE') => void;
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  selectedModelIds: string[];
  setSelectedModelIds: (ids: string[]) => void;
  attachments: SkillAttachment[];
  isDirty: boolean;
  saveStatus: SaveStatus;
  error: string | null;
  setError: (error: string | null) => void;
  skillId: string | null;
  handleSave: () => Promise<void>;
  handleUploadAttachment: (file: File) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  uploadProgress: Record<string, number>;
}

export function useSkillStudio({
  initialData,
  onSaveSuccess,
}: UseSkillStudioOptions): UseSkillStudioReturn {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>(
    initialData?.visibility ?? 'PRIVATE'
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tagIds ?? []);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>(initialData?.modelIds ?? []);
  const [attachments, setAttachments] = useState<SkillAttachment[]>(initialData?.attachments ?? []);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [skillId, setSkillId] = useState<string | null>(initialData?.id ?? null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const initialRef = useRef(initialData);

  // Track dirty state
  useEffect(() => {
    if (!initialRef.current) {
      // New skill - dirty if any field has content
      setIsDirty(name.trim().length > 0 || content.trim().length > 0);
      return;
    }
    const init = initialRef.current;
    const changed =
      name !== init.name ||
      (description || '') !== (init.description || '') ||
      content !== init.content ||
      visibility !== init.visibility ||
      JSON.stringify(selectedTagIds) !== JSON.stringify(init.tagIds ?? []) ||
      JSON.stringify(selectedModelIds) !== JSON.stringify(init.modelIds ?? []);
    setIsDirty(changed);
  }, [name, description, content, visibility, selectedTagIds, selectedModelIds]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaveStatus('saving');
    setError(null);

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || null,
        content,
        visibility,
        tagIds: selectedTagIds.filter((id) => !id.startsWith('temp-')),
        newTagNames: [] as string[],
        modelIds: selectedModelIds,
      };

      let response: Response;

      if (skillId) {
        // Update existing
        response = await fetch(`/api/skills/${skillId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // Create new
        response = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Failed to save skill'));
      }

      const savedSkill = await response.json();
      const newId = savedSkill.id;

      if (!skillId) {
        setSkillId(newId);
      }

      // Update initial ref to reflect saved state
      initialRef.current = {
        id: newId,
        name: name.trim(),
        description: description.trim() || null,
        content,
        visibility,
        tagIds: selectedTagIds,
        modelIds: selectedModelIds,
        attachments,
      };

      setSaveStatus('saved');
      setIsDirty(false);

      if (onSaveSuccess) {
        onSaveSuccess(newId);
      }

      // Reset saved status after 3s
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Unknown error'));
      setSaveStatus('error');
    }
  }, [name, description, content, visibility, selectedTagIds, selectedModelIds, skillId, attachments, onSaveSuccess]);

  const handleUploadAttachment = useCallback(async (file: File) => {
    if (!skillId) {
      setError('Please save the skill first before uploading attachments');
      return;
    }

    const tempId = `upload-${Date.now()}`;
    setUploadProgress((prev) => ({ ...prev, [tempId]: 0 }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      setUploadProgress((prev) => ({ ...prev, [tempId]: 30 }));

      const response = await fetch(`/api/skills/${skillId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      setUploadProgress((prev) => ({ ...prev, [tempId]: 80 }));

      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Failed to upload file'));
      }

      const attachment = await response.json();
      setAttachments((prev) => [...prev, attachment]);
      setUploadProgress((prev) => ({ ...prev, [tempId]: 100 }));

      // Remove progress after delay
      setTimeout(() => {
        setUploadProgress((prev) => omitKey(prev, tempId));
      }, 1000);
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'));
      setUploadProgress((prev) => omitKey(prev, tempId));
    }
  }, [skillId]);

  const handleDeleteAttachment = useCallback(async (attachmentId: string) => {
    if (!skillId) return;

    try {
      const response = await fetch(`/api/skills/${skillId}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response, 'Failed to delete attachment'));
      }

      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      setError(getErrorMessage(err, 'Delete failed'));
    }
  }, [skillId]);

  return {
    name,
    setName,
    description,
    setDescription,
    content,
    setContent,
    visibility,
    setVisibility,
    selectedTagIds,
    setSelectedTagIds,
    selectedModelIds,
    setSelectedModelIds,
    attachments,
    isDirty,
    saveStatus,
    error,
    setError,
    skillId,
    handleSave,
    handleUploadAttachment,
    handleDeleteAttachment,
    uploadProgress,
  };
}
