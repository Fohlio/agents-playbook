'use client';

import { Tooltip } from '@/shared/ui/molecules';

interface GeneralSettingsProps {
  includeMultiAgentChat: boolean;
  onChange: (value: boolean) => void;
  compact?: boolean;
}

export function GeneralSettings({ includeMultiAgentChat, onChange, compact = false }: GeneralSettingsProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip content="Enable Multi-Agent Chat: Automatically adds internal agents coordination chat after each mini-prompt for parallel work with structured communication.">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeMultiAgentChat}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-text-primary">
              Multi-Agent Chat
            </span>
          </label>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="bg-surface-base border border-border-base rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">General Settings</h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="include-multi-agent-chat"
            checked={includeMultiAgentChat}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor="include-multi-agent-chat"
                className="text-sm font-medium text-text-primary cursor-pointer"
              >
                Include Multi-Agent Chat
              </label>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Enables parallel agent work with coordinated communication protocol
            </p>
          </div>
        </div>

        {includeMultiAgentChat && (
          <div className="ml-7 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Multi-Agent Chat Active
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Internal coordination chat will be added after each mini-prompt to enable
                  simultaneous work by multiple agents with status tracking and blocker management.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
