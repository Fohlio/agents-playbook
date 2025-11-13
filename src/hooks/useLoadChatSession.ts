'use client';

import { useState } from 'react';
import { getChatHistory } from '@/features/ai-assistant/actions/chat-actions';
import { ModelMessage } from 'ai';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolInvocations?: unknown[];
}

interface ChatSessionDetails {
  id: string;
  messages: Message[];
}

interface UseLoadChatSessionReturn {
  loadSession: (sessionId: string) => Promise<ChatSessionDetails | null>;
  isLoading: boolean;
  error: Error | undefined;
}

/**
 * Hook for loading a specific chat session with its full history
 *
 * Uses the getChatHistory server action to fetch messages from the database
 *
 * @returns Load function and state
 */
export function useLoadChatSession(): UseLoadChatSessionReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const loadSession = async (sessionId: string): Promise<ChatSessionDetails | null> => {
    setIsLoading(true);
    setError(undefined);

    try {
      const result = await getChatHistory(sessionId);

      if (!result.success || !result.messages) {
        throw new Error(result.error || 'Failed to load session');
      }

      // Convert ModelMessage[] to Message[]
      const messages: Message[] = result.messages.map((msg: ModelMessage, index: number) => ({
        id: `${sessionId}-${index}`,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        toolInvocations: (msg as { toolInvocations?: unknown[] }).toolInvocations || [],
      }));

      return {
        id: sessionId,
        messages,
      };
    } catch (err) {
      const loadError = err instanceof Error ? err : new Error('Unknown error');
      setError(loadError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadSession,
    isLoading,
    error,
  };
}
