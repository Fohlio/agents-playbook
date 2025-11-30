'use client';

import { useState, useEffect } from 'react';
import { listChatSessions } from '@/features/ai-assistant/actions/chat-actions';

interface ChatSession {
  id: string;
  mode: string;
  workflowName?: string;
  miniPromptName?: string;
  lastMessageAt: Date;
  tokenUsage: {
    total: number;
  };
  messageCount: number;
}

interface UseAIChatSessionsOptions {
  mode: 'workflow' | 'mini-prompt';
  workflowId?: string;
  miniPromptId?: string;
}

interface UseAIChatSessionsReturn {
  sessions: ChatSession[];
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
}

/**
 * Hook for loading chat sessions
 *
 * Uses the listChatSessions server action to fetch active (non-archived) sessions
 *
 * @param options - Session query options
 * @returns Sessions state and functions
 */
export function useAIChatSessions({
  mode,
  workflowId,
  miniPromptId,
}: UseAIChatSessionsOptions): UseAIChatSessionsReturn {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const loadSessions = async () => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await listChatSessions();

      if (!result.success || !result.sessions) {
        throw new Error(result.error || 'Failed to load sessions');
      }

      // Filter sessions by mode only (workflowId/miniPromptId filtering removed as we don't have IDs in response)
      // The server returns all sessions, and we filter by mode only
      const filteredSessions = result.sessions
        .filter((session) => session.mode === mode)
        .map((session) => ({
          ...session,
          tokenUsage: {
            total: session.totalTokens,
          },
        }));

      setSessions(filteredSessions);
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Unknown error');
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, workflowId, miniPromptId]);

  return {
    sessions,
    isLoading,
    error,
    refresh: loadSessions,
  };
}
