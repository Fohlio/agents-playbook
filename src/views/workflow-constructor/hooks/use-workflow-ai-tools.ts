import { useCallback, useState } from 'react';
import type { WorkflowStageWithMiniPrompts, WorkflowComplexity } from '@/shared/lib/types/workflow-constructor-types';
import type { AIToolResult } from '@/types/ai-chat';
import type { MiniPrompt } from '@prisma/client';
import type { Tag } from '@/shared/ui/molecules';

/**
 * Hook Parameters
 */
interface UseWorkflowAIToolsParams {
  localStages: WorkflowStageWithMiniPrompts[];
  setLocalStages: (stages: WorkflowStageWithMiniPrompts[]) => void;
  setWorkflowName: (name: string) => void;
  setComplexity: (complexity: WorkflowComplexity | null) => void;
  setIncludeMultiAgentChat: (include: boolean) => void;
  setIsPublic: (isPublic: boolean) => void;
  setMiniPrompts?: (miniPrompts: MiniPrompt[] | ((prev: MiniPrompt[]) => MiniPrompt[])) => void;
  setSelectedTagIds?: (tagIds: string[]) => void;
  markDirty: () => void;
}

/**
 * useWorkflowAITools Hook
 *
 * Processes AI tool results and updates local workflow state.
 * Handles temporary IDs and position-based identification for stages and mini-prompts.
 *
 * @param params - Local state setters and markDirty function
 * @returns handleToolResult callback
 */
export function useWorkflowAITools({
  localStages,
  setLocalStages,
  setWorkflowName,
  setComplexity,
  setIncludeMultiAgentChat,
  setIsPublic,
  setMiniPrompts,
  setSelectedTagIds,
  markDirty,
}: UseWorkflowAIToolsParams) {
  // Track all tags (including temp ones created by AI)
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Helper to convert tag names to IDs, creating temp tags as needed
  const getTagIdsFromNames = useCallback((tagNames: string[]): string[] => {
    const tagIds: string[] = [];

    tagNames.forEach((tagName) => {
      // Find existing tag (case-insensitive)
      let tag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());

      if (!tag) {
        // Create temp tag
        tag = {
          id: `temp-tag-${Date.now()}-${tagName}`,
          name: tagName,
          color: null,
          isTemporary: true,
        };
        setAllTags(prev => [...prev, tag!]);
      }

      tagIds.push(tag.id);
    });

    return tagIds;
  }, [allTags]);

  // Fetch existing tags on mount
  useState(() => {
    fetch('/api/tags')
      .then(res => res.json())
      .then((tags: Tag[]) => setAllTags(tags))
      .catch(err => console.error('[useWorkflowAITools] Failed to fetch tags:', err));
  });

  const handleToolResult = useCallback(
    (result: AIToolResult) => {
      console.log('[useWorkflowAITools] Handling tool result:', result);
      console.log('[useWorkflowAITools] Type of result:', typeof result);
      console.log('[useWorkflowAITools] Is array:', Array.isArray(result));
      console.log('[useWorkflowAITools] Result keys:', Object.keys(result));

      // Check if result is a string being passed as indexed object
      if (typeof result === 'string') {
        console.error('[useWorkflowAITools] Result is a STRING, not an object:', result);
        return;
      }

      // Check if result is character-indexed (malformed string spread)
      if (typeof result === 'object' && result !== null && '0' in result && '1' in result && typeof result[0] === 'string') {
        console.error('[useWorkflowAITools] Result appears to be a character-indexed string object');
        console.error('[useWorkflowAITools] Reconstructing string from indexed object...');
        const chars = Object.keys(result)
          .filter(k => !isNaN(Number(k)))
          .sort((a, b) => Number(a) - Number(b))
          .map(k => result[k as keyof typeof result]);
        const reconstructedString = chars.join('');
        console.error('[useWorkflowAITools] Reconstructed error message:', reconstructedString);
        return;
      }

      if (!result.success) {
        console.log('[useWorkflowAITools] Tool result not successful, skipping');
        return;
      }

      switch (result.action) {
        case 'createWorkflow': {
          console.log('[useWorkflowAITools] createWorkflow action');
          // Handle complete workflow creation
          if (result.workflow) {
            console.log('[useWorkflowAITools] Setting workflow name:', result.workflow.name);
            setWorkflowName(result.workflow.name);
            if (result.workflow.complexity) {
              console.log('[useWorkflowAITools] Setting complexity:', result.workflow.complexity);
              setComplexity(result.workflow.complexity);
            }
            if (result.workflow.includeMultiAgentChat !== undefined) {
              console.log('[useWorkflowAITools] Setting includeMultiAgentChat:', result.workflow.includeMultiAgentChat);
              setIncludeMultiAgentChat(result.workflow.includeMultiAgentChat);
            }
            // Handle tags
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((result.workflow as any).tags && (result.workflow as any).tags.length > 0 && setSelectedTagIds) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              console.log('[useWorkflowAITools] Setting tags:', (result.workflow as any).tags);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tagIds = getTagIdsFromNames((result.workflow as any).tags);
              setSelectedTagIds(tagIds);
            }

            // Create stages with mini-prompts
            if (result.workflow.stages && result.workflow.stages.length > 0) {
              interface MiniPromptData {
                id?: string;
                name: string;
                description?: string;
                content?: string;
              }

              interface StageInputData {
                name: string;
                description?: string;
                color?: string;
                withReview?: boolean;
                includeMultiAgentChat?: boolean;
                miniPrompts?: MiniPromptData[];
              }

              const newStages: WorkflowStageWithMiniPrompts[] = result.workflow.stages.map((stageData: StageInputData, stageIdx: number) => {
                const stageId = `temp-stage-${Date.now()}-${stageIdx}`;

                const stage: Omit<WorkflowStageWithMiniPrompts, 'itemOrder'> & { itemOrder?: string[] } = {
                  id: stageId,
                  workflowId: '',
                  name: stageData.name,
                  description: stageData.description || null,
                  color: stageData.color || '#64748b',
                  order: stageIdx,
                  withReview: stageData.withReview ?? true,
                  includeMultiAgentChat: stageData.includeMultiAgentChat ?? false,
                  createdAt: new Date(),
                  miniPrompts: stageData.miniPrompts?.map((mp, mpIdx: number) => {
                    const miniPromptId = mp.id || `temp-mp-${Date.now()}-${stageIdx}-${mpIdx}`;

                    return {
                      stageId,
                      miniPromptId,
                      order: mpIdx,
                      miniPrompt: {
                        id: miniPromptId,
                        userId: 'temp-user',
                        name: mp.name,
                        description: mp.description || null,
                        content: mp.content || '',
                        visibility: 'PRIVATE' as const,
                        isActive: true,
                        isSystemMiniPrompt: false,
                        isAutomatic: false,
                        key: null,
                        position: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      },
                    };
                  }) || [],
                };
                
                return stage as WorkflowStageWithMiniPrompts;
              });

              setLocalStages(newStages);

              // Extract all new mini-prompts and add to library
              if (setMiniPrompts) {
                const newMiniPrompts: MiniPrompt[] = [];
                newStages.forEach(stage => {
                  stage.miniPrompts.forEach(smp => {
                    // Only add if it's a new mini-prompt (temp ID or not already in library)
                    if (smp.miniPrompt.id.startsWith('temp-')) {
                      newMiniPrompts.push(smp.miniPrompt);
                    }
                  });
                });

                if (newMiniPrompts.length > 0) {
                  setMiniPrompts(prev => [...prev, ...newMiniPrompts]);
                }
              }
            }

            markDirty();
          }
          break;
        }

        case 'modify_stage': {
          // Find stage by ID or position
          const stagePosition = result.stagePosition ?? result.stageIndex;

          const updatedStages = localStages.map((stage, index) => {
            const matchesId = result.stageId && stage.id === result.stageId;
            const matchesPosition = stagePosition !== undefined && index === stagePosition;

            if (matchesId || matchesPosition) {
              const updates: Partial<WorkflowStageWithMiniPrompts> = { ...stage };
              if (result.updates?.name) updates.name = result.updates.name as string;
              if (result.updates?.description !== undefined) updates.description = result.updates.description as string;
              if (result.updates?.color) updates.color = result.updates.color as string;
              if (result.updates?.withReview !== undefined) updates.withReview = result.updates.withReview as boolean;

              // Handle mini-prompts replacement if provided
              if (result.updates?.miniPrompts) {
                updates.miniPrompts = (result.updates.miniPrompts as Array<{ id?: string; name: string; description?: string; content?: string }>).map((mp, mpIndex) => ({
                    stageId: stage.id,
                    miniPromptId: mp.id ?? `temp-mp-${Date.now()}-${mpIndex}`,
                    order: mpIndex,
                    miniPrompt: {
                      id: mp.id ?? `temp-mp-${Date.now()}-${mpIndex}`,
                      userId: 'temp-user',
                      name: mp.name,
                      description: mp.description ?? null,
                      content: mp.content ?? '',
                      visibility: 'PRIVATE' as const,
                      isActive: true,
                      isSystemMiniPrompt: false,
                      isAutomatic: false,
                      key: null,
                      position: 0,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                  }));
              }

              return updates as WorkflowStageWithMiniPrompts;
            }
            return stage;
          });

          setLocalStages(updatedStages);
          markDirty();
          break;
        }

        case 'modify_mini_prompt': {
          console.log('[useWorkflowAITools] modify_mini_prompt action');
          console.log('[useWorkflowAITools] stagePosition:', result.stagePosition, 'miniPromptPosition:', result.miniPromptPosition);
          console.log('[useWorkflowAITools] miniPromptId:', result.miniPromptId);

          // Find the mini-prompt ID if using position-based identification
          let targetMiniPromptId = result.miniPromptId;
          if (!targetMiniPromptId && result.stagePosition !== undefined && result.miniPromptPosition !== undefined) {
            const targetStage = localStages[result.stagePosition];
            if (targetStage?.miniPrompts[result.miniPromptPosition]) {
              targetMiniPromptId = targetStage.miniPrompts[result.miniPromptPosition].miniPromptId;
              console.log('[useWorkflowAITools] Found mini-prompt ID from position:', targetMiniPromptId);
            }
          }

          // Find mini-prompt by ID or by stage position + mini-prompt position
          const updatedStages = localStages.map((stage, stageIndex) => {
            // Check if this is the target stage
            const isTargetStage =
              (result.stagePosition !== undefined && stageIndex === result.stagePosition) ||
              (targetMiniPromptId && stage.miniPrompts.some(mp => mp.miniPromptId === targetMiniPromptId));

            if (!isTargetStage) return stage;

            return {
              ...stage,
              miniPrompts: stage.miniPrompts.map((smp, mpIndex) => {
                const matchesId = targetMiniPromptId && smp.miniPromptId === targetMiniPromptId;
                const matchesPosition =
                  result.stagePosition !== undefined &&
                  result.miniPromptPosition !== undefined &&
                  stageIndex === result.stagePosition &&
                  mpIndex === result.miniPromptPosition;

                if (matchesId || matchesPosition) {
                  console.log('[useWorkflowAITools] Updating mini-prompt:', smp.miniPrompt.name);
                  const updatedMiniPrompt = { ...smp.miniPrompt };
                  if (result.updates?.name) updatedMiniPrompt.name = result.updates.name as string;
                  if (result.updates?.description !== undefined) updatedMiniPrompt.description = result.updates.description as string;
                  if (result.updates?.content) updatedMiniPrompt.content = result.updates.content as string;
                  updatedMiniPrompt.updatedAt = new Date();

                  return {
                    ...smp,
                    miniPrompt: updatedMiniPrompt,
                  };
                }
                return smp;
              }),
            };
          });

          console.log('[useWorkflowAITools] Setting updated stages');
          setLocalStages(updatedStages);

          // Also update the miniPrompts array in library
          if (setMiniPrompts && targetMiniPromptId && result.updates) {
            console.log('[useWorkflowAITools] Updating mini-prompt in library:', targetMiniPromptId);
            setMiniPrompts((prev) =>
              prev.map((mp) => {
                if (mp.id === targetMiniPromptId) {
                  const updated = { ...mp };
                  if (result.updates?.name) updated.name = result.updates.name as string;
                  if (result.updates?.description !== undefined) updated.description = result.updates.description as string;
                  if (result.updates?.content) updated.content = result.updates.content as string;
                  updated.updatedAt = new Date();
                  return updated;
                }
                return mp;
              })
            );
          }

          markDirty();
          break;
        }

        case 'update_workflow_settings': {
          if (result.updates?.name) {
            setWorkflowName(result.updates.name as string);
          }
          if (result.updates?.complexity) {
            setComplexity(result.updates.complexity as WorkflowComplexity);
          }
          if (result.updates?.includeMultiAgentChat !== undefined) {
            setIncludeMultiAgentChat(result.updates.includeMultiAgentChat as boolean);
          }
          if (result.updates?.visibility) {
            setIsPublic(result.updates.visibility === 'PUBLIC');
          }
          markDirty();
          break;
        }

        case 'add_stage': {
          if (!result.stage) break;

          const newStage: Omit<WorkflowStageWithMiniPrompts, 'itemOrder'> & { itemOrder?: string[] } = {
            id: `temp-${Date.now()}`,
            workflowId: '', // Will be set on save
            name: result.stage.name,
            description: result.stage.description ?? null,
            color: result.stage.color ?? '#64748b',
            withReview: result.stage.withReview ?? true,
            includeMultiAgentChat: result.stage.includeMultiAgentChat ?? false,
            order: result.stage.position ?? localStages.length,
            createdAt: new Date(),
            miniPrompts: result.stage.miniPrompts?.map((mp, index) => ({
              stageId: `temp-${Date.now()}`,
              miniPromptId: mp.id ?? `temp-mp-${Date.now()}-${index}`,
              order: index,
              miniPrompt: {
                id: mp.id ?? `temp-mp-${Date.now()}-${index}`,
                userId: 'temp-user',
                name: mp.name,
                description: mp.description ?? null,
                content: mp.content ?? '',
                visibility: 'PRIVATE' as const,
                isActive: true,
                isSystemMiniPrompt: false,
                isAutomatic: false,
                key: null,
                position: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })) ?? [],
          };
          
          const typedStage = newStage as WorkflowStageWithMiniPrompts;

          // Insert at position or append
          const position = result.stage.position;
          if (position !== undefined && position >= 0 && position < localStages.length) {
            const updatedStages = [...localStages];
            updatedStages.splice(position, 0, typedStage);
            setLocalStages(updatedStages);
          } else {
            setLocalStages([...localStages, typedStage]);
          }

          markDirty();
          break;
        }

        case 'remove_stage': {
          const stagePosition = result.stagePosition ?? result.stageIndex;

          if (stagePosition !== undefined) {
            const updatedStages = localStages.filter((_, index) => index !== stagePosition);
            setLocalStages(updatedStages);
            markDirty();
          } else if (result.stageId) {
            const updatedStages = localStages.filter((stage) => stage.id !== result.stageId);
            setLocalStages(updatedStages);
            markDirty();
          }
          break;
        }

        default:
          console.warn('Unknown AI tool action:', result.action);
      }
    },
    [
      localStages,
      setLocalStages,
      setWorkflowName,
      setComplexity,
      setIncludeMultiAgentChat,
      setIsPublic,
      setMiniPrompts,
      setSelectedTagIds,
      getTagIdsFromNames,
      markDirty,
    ]
  );

  return { handleToolResult };
}
