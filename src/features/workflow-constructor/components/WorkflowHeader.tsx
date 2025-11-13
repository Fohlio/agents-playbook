'use client';

import { Input, Button, BetaBadge, Checkbox, Textarea } from '@/shared/ui/atoms';
import { TagMultiSelect, Tooltip } from '@/shared/ui/molecules';

interface WorkflowHeaderProps {
  workflowName: string;
  workflowDescription: string | null;
  isActive: boolean;
  isPublic: boolean;
  includeMultiAgentChat: boolean;
  selectedTagIds: string[];
  isDirty: boolean;
  isSaving: boolean;
  onWorkflowNameChange: (name: string) => void;
  onWorkflowDescriptionChange: (description: string | null) => void;
  onIsActiveChange: (isActive: boolean) => void;
  onIsPublicChange: (isPublic: boolean) => void;
  onIncludeMultiAgentChatChange: (include: boolean) => void;
  onSelectedTagIdsChange: (tagIds: string[]) => void;
  onSave: () => void;
}

export function WorkflowHeader({
  workflowName,
  workflowDescription,
  isActive,
  isPublic,
  includeMultiAgentChat,
  selectedTagIds,
  isDirty,
  isSaving,
  onWorkflowNameChange,
  onWorkflowDescriptionChange,
  onIsActiveChange,
  onIsPublicChange,
  onIncludeMultiAgentChatChange,
  onSelectedTagIdsChange,
  onSave,
}: WorkflowHeaderProps) {
  return (
    <div className="bg-surface-base border-b border-border-base px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <Input
            type="text"
            value={workflowName}
            onChange={(e) => {
              onWorkflowNameChange(e.target.value);
            }}
            placeholder="Workflow Name"
            className="text-2xl font-bold border-0 bg-transparent focus:ring-0 px-0"
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      {/* System panel - single row with checkboxes and tags */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <Checkbox
            checked={isActive}
            onChange={(e) => onIsActiveChange(e.target.checked)}
            id="workflow-active-checkbox"
            label="Active"
          />
          <Checkbox
            checked={isPublic}
            onChange={(e) => onIsPublicChange(e.target.checked)}
            id="workflow-public-checkbox"
            label="Public"
          />
          <Tooltip content="Enable AI coordination prompts after each mini-prompt to help multiple agents collaborate effectively">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={includeMultiAgentChat}
                onChange={(e) => onIncludeMultiAgentChatChange(e.target.checked)}
                id="multi-agent-chat-checkbox"
              />
              <label htmlFor="multi-agent-chat-checkbox" className="text-sm text-text-secondary flex items-center gap-1 cursor-pointer">
                Multi-Agent Chat
                <BetaBadge />
              </label>
            </div>
          </Tooltip>
        </div>
        
        {/* Tags multiselect */}
        <div className="flex-1 min-w-[300px]">
          <TagMultiSelect
            selectedTagIds={selectedTagIds}
            onChange={onSelectedTagIdsChange}
          />
        </div>
      </div>

      {/* Description textarea below top panel */}
      <div className="mt-4 relative">
        <Textarea
          value={workflowDescription || ''}
          onChange={(e) => {
            const value = e.target.value || null;
            onWorkflowDescriptionChange(value);
          }}
          placeholder="Workflow Description (optional)"
          maxLength={500}
          rows={3}
          fullWidth
          className="text-text-secondary"
        />
        <div className={`absolute bottom-2 right-2 text-xs ${(workflowDescription?.length || 0) > 480 ? 'text-red-500' : 'text-gray-400'}`}>
          {workflowDescription?.length || 0}/500
        </div>
      </div>
    </div>
  );
}

