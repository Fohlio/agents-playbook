'use client';

import { useState, useCallback } from 'react';
import { AIChatMode, WorkflowContext, AIToolResult } from '@/types/ai-chat';

interface UseAIChatOptions {
  mode: AIChatMode;
  workflowContext?: WorkflowContext;
  sessionId?: string;
  onToolCall?: (toolResult: AIToolResult) => void;
  onError?: (error: Error) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolInvocations?: unknown[];
}

interface UseAIChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  error: Error | undefined;
  setInput: (input: string) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  reload: () => void;
  stop: () => void;
  append: (message: { role: 'user'; content: string }) => void;
  tokenCount: number;
  sessionId: string | null;
  loadSession: (sessionId: string, initialMessages: Message[]) => void;
}

/**
 * Hook for AI chat functionality with tool calling
 *
 * Handles complete (non-streaming) responses from the AI chat endpoint
 *
 * @param options - Chat configuration options
 * @returns Chat state and functions
 */
export function useAIChat({
  mode,
  workflowContext,
  sessionId: initialSessionId,
  onToolCall,
  onError,
}: UseAIChatOptions): UseAIChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [tokenCount, setTokenCount] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    initialSessionId || null
  );

  const append = useCallback(
    async (message: { role: 'user'; content: string }) => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: message.role,
        content: message.content,
        toolInvocations: [],
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(undefined);

      try {
        const response = await fetch('/api/ai-assistant/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.content,
            mode,
            workflowContext,
            sessionId: currentSessionId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get AI response');
        }

        // Parse non-streaming JSON response
        const data = await response.json();
        const { sessionId: responseSessionId, message: assistantMsg, tokenUsage } = data;

        // Update session ID if this is a new session
        if (responseSessionId && !currentSessionId) {
          setCurrentSessionId(responseSessionId);
        }

        // Add assistant message to state
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantMsg.content,
          toolInvocations: assistantMsg.toolInvocations || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Process tool invocations if callback provided
        if (onToolCall && assistantMsg.toolInvocations && assistantMsg.toolInvocations.length > 0) {
          interface ToolInvocation {
            type?: string;
            output?: unknown;
            state?: string;
            result?: unknown;
            success?: boolean;
            workflow?: unknown;
            action?: string;
          }
          assistantMsg.toolInvocations.forEach((invocation: ToolInvocation, index: number) => {
            console.log(`[useAIChat] Processing tool invocation ${index}:`, invocation);
            console.log(`[useAIChat] Invocation type:`, invocation.type);
            console.log(`[useAIChat] Invocation.output type:`, typeof invocation.output);
            console.log(`[useAIChat] Invocation.output value:`, invocation.output);

            // AI SDK v5 format: type: 'tool-result' with output property
            if (invocation.type === 'tool-result' && invocation.output !== undefined) {
              // Check if output is a string error message - don't spread it
              if (typeof invocation.output === 'string') {
                console.warn('[useAIChat] Tool output is a string (likely an error), wrapping:', invocation.output);
                const wrappedError = {
                  success: false,
                  error: invocation.output,
                  message: invocation.output
                };
                console.log('[useAIChat] Calling onToolCall with wrapped error:', wrappedError);
                onToolCall(wrappedError);
              } else if (invocation.output && typeof invocation.output === 'object') {
                console.log('[useAIChat] Calling onToolCall with invocation.output:', invocation.output);
                onToolCall(invocation.output as AIToolResult);
              }
            }
            // Legacy format: state: 'result' with result property
            else if (invocation.state === 'result' && invocation.result !== undefined) {
              if (typeof invocation.result === 'string') {
                console.warn('[useAIChat] Tool result is a string (likely an error), wrapping:', invocation.result);
                const wrappedError = {
                  success: false,
                  error: invocation.result,
                  message: invocation.result
                };
                console.log('[useAIChat] Calling onToolCall with wrapped error:', wrappedError);
                onToolCall(wrappedError);
              } else if (invocation.result && typeof invocation.result === 'object') {
                console.log('[useAIChat] Calling onToolCall with invocation.result:', invocation.result);
                onToolCall(invocation.result as AIToolResult);
              }
            }
            // Fallback: try to call with the invocation itself if it has expected properties
            else if (invocation.success !== undefined && (invocation.workflow || invocation.action)) {
              console.log('[useAIChat] Calling onToolCall with invocation itself:', invocation);
              onToolCall(invocation as AIToolResult);
            } else {
              console.warn('[useAIChat] Invocation format not recognized, skipping:', invocation);
            }
          });
        }

        // Update token count from API response
        setTokenCount(tokenUsage.total);
      } catch (err) {
        const chatError = err instanceof Error ? err : new Error('Unknown error');
        setError(chatError);
        if (onError) {
          onError(chatError);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [mode, workflowContext, currentSessionId, onToolCall, onError]
  );

  const handleSubmit = useCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }
      if (!input.trim() || isLoading) return;

      append({ role: 'user', content: input });
      setInput('');
    },
    [input, isLoading, append]
  );

  const reload = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMessage) {
        // Remove last assistant message and regenerate
        setMessages((prev) => prev.filter((m) => m.role === 'user'));
        append({ role: 'user', content: lastUserMessage.content });
      }
    }
  }, [messages, append]);

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  const loadSession = useCallback(
    (sessionId: string, initialMessages: Message[]) => {
      setCurrentSessionId(sessionId);
      setMessages(initialMessages);

      // Calculate token count from loaded messages
      const totalChars = initialMessages.reduce(
        (sum, msg) => sum + msg.content.length,
        0
      );
      setTokenCount(Math.ceil(totalChars / 4));
    },
    []
  );

  return {
    messages,
    input,
    isLoading,
    error,
    setInput,
    handleSubmit,
    reload,
    stop,
    append,
    tokenCount,
    sessionId: currentSessionId,
    loadSession,
  };
}
