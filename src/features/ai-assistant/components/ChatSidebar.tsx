'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIChatSessions } from '@/hooks/useAIChatSessions';
import { useLoadChatSession } from '@/hooks/useLoadChatSession';
import { AIChatMode, WorkflowContext, AIToolResult } from '@/types/ai-chat';
import { X, Send, Sparkles, AlertCircle, Loader2, History, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BetaBadge, Badge } from '@/shared/ui/atoms';
import { ApiKeyModal } from './ApiKeyModal';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AIChatMode;
  workflowContext?: WorkflowContext;
  sessionId?: string;
  onToolCall?: (toolResult: AIToolResult) => void;
}

export function ChatSidebar({
  isOpen,
  onClose,
  mode,
  workflowContext,
  sessionId,
  onToolCall,
}: ChatSidebarProps) {
  const [showError, setShowError] = useState(false);
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    input,
    isLoading,
    error,
    setInput,
    handleSubmit,
    tokenCount,
    loadSession,
    sessionId: currentSessionId,
  } = useAIChat({
    mode,
    workflowContext,
    sessionId,
    onToolCall,
    onError: (err) => {
      console.error('Chat error:', err);
      setShowError(true);
    },
  });

  // Load available sessions
  const {
    sessions,
    isLoading: isLoadingSessions,
    refresh: refreshSessions,
  } = useAIChatSessions({
    mode,
    workflowId: workflowContext?.workflow?.id,
    miniPromptId: undefined, // TODO: Add mini-prompt support
  });

  // Load specific session
  const { loadSession: fetchSession, isLoading: isLoadingSession } =
    useLoadChatSession();

  // Handle session selection
  const handleSelectSession = async (selectedSessionId: string) => {
    const sessionData = await fetchSession(selectedSessionId);
    if (sessionData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadSession(sessionData.id, sessionData.messages as any);
      setShowSessionSelector(false);
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    loadSession('', []);
    setShowSessionSelector(false);
    refreshSessions();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens and track open/close state
  useEffect(() => {
    console.log('[ChatSidebar] isOpen changed to:', isOpen);
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            AI Assistant
            <BetaBadge size="sm" />
            <span className="text-sm text-gray-500">
              ({mode === 'workflow' ? 'Workflow' : 'Mini-Prompt'})
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessionSelector(!showSessionSelector)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle session history"
            title="Session History"
          >
            <History className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => {
              // Prevent closing while AI is thinking/responding
              if (isLoading) {
                console.warn('[ChatSidebar] Prevented close during AI processing');
                return;
              }
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close chat"
            disabled={isLoading}
          >
            <X className={`w-5 h-5 ${isLoading ? 'text-gray-300' : 'text-gray-500'}`} />
          </button>
        </div>
      </div>

      {/* Session Selector */}
      {showSessionSelector && (
        <div className="border-b border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-900">
                Chat History
              </h3>
              <button
                onClick={handleNewChat}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                New Chat
              </button>
            </div>
          </div>

          {isLoadingSessions ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500 mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No previous chats</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const isActive = session.id === currentSessionId;
                return (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    disabled={isLoadingSession}
                    className={`w-full p-3 hover:bg-white transition-colors text-left ${
                      isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                    data-testid={isActive ? 'active-session' : 'inactive-session'}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.lastMessageAt).toLocaleString()}
                          </p>
                          {isActive && (
                            <Badge variant="primary" testId="active-badge">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">
                          {session.messageCount} message{session.messageCount !== 1 ? 's' : ''} · {session.tokenUsage.total.toLocaleString()} tokens
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Token Counter */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
        Tokens: ~{tokenCount.toLocaleString()} / 272,000
        {tokenCount > 220000 && (
          <span className="text-orange-600 ml-2">
            (Approaching limit - conversation will be summarized)
          </span>
        )}
      </div>

      {/* Error Banner */}
      {showError && error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error.message}</p>
            <div className="flex items-center gap-2 mt-2">
              {(error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('apikey')) && (
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add API Key
                </button>
              )}
              <button
                onClick={() => setShowError(false)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {mode === 'workflow'
                ? 'Ask me to create or modify workflows'
                : 'Ask me to create or edit mini-prompts'}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 break-words overflow-wrap-anywhere ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none break-words prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:text-xs prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-800 prose-pre:text-white prose-pre:break-words prose-code:break-words">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
              {message.toolInvocations && message.toolInvocations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs opacity-75">
                    {message.toolInvocations.length} tool(s) called
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <p className="text-sm text-gray-600">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'workflow'
                ? 'Describe the workflow you want to create...'
                : 'Describe the mini-prompt you want to create...'
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={() => {
          // Clear error after saving API key
          setShowError(false);
        }}
      />
    </div>
  );
}
