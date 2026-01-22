'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAIChat } from '@/features/ai-assistant/hooks/useAIChat';
import { useAIChatSessions } from '@/features/ai-assistant/hooks/useAIChatSessions';
import { useLoadChatSession } from '@/features/ai-assistant/hooks/useLoadChatSession';
import { AIChatMode, WorkflowContext, AIToolResult } from '@/types/ai-chat';
import { X, Send, Sparkles, AlertCircle, Loader2, History, Clock } from 'lucide-react';
import { MarkdownContent } from '@/shared/ui/atoms/MarkdownContent';
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
  const t = useTranslations('aiAssistant');
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

  const {
    sessions,
    isLoading: isLoadingSessions,
    refresh: refreshSessions,
  } = useAIChatSessions({
    mode,
    workflowId: workflowContext?.workflow?.id,
    miniPromptId: undefined,
  });

  const { loadSession: fetchSession, isLoading: isLoadingSession } =
    useLoadChatSession();

  const handleSelectSession = async (selectedSessionId: string) => {
    const sessionData = await fetchSession(selectedSessionId);
    if (sessionData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      loadSession(sessionData.id, sessionData.messages as any);
      setShowSessionSelector(false);
    }
  };

  const handleNewChat = () => {
    loadSession('', []);
    setShowSessionSelector(false);
    refreshSessions();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    console.log('[ChatSidebar] isOpen changed to:', isOpen);
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-[#0a0a0f] border-l border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-[#050508]/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2" style={{ textShadow: '0 0 10px #a855f740' }}>
            {t('title')}
            <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/50">
              {t('beta')}
            </span>
            <span className="text-xs text-cyan-100/40">
              ({mode === 'workflow' ? t('mode.workflow') : t('mode.prompt')})
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessionSelector(!showSessionSelector)}
            className="p-2 hover:bg-purple-500/10 transition-colors cursor-pointer"
            aria-label={t('history')}
            title={t('history')}
          >
            <History className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={() => {
              if (isLoading) {
                console.warn('[ChatSidebar] Prevented close during AI processing');
                return;
              }
              onClose();
            }}
            className="p-2 hover:bg-cyan-500/10 transition-colors cursor-pointer"
            aria-label={t('close')}
            disabled={isLoading}
          >
            <X className={`w-5 h-5 ${isLoading ? 'text-cyan-100/30' : 'text-cyan-400'}`} />
          </button>
        </div>
      </div>

      {/* Session Selector */}
      {showSessionSelector && (
        <div className="border-b border-purple-500/20 bg-[#050508]/50 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-purple-500/20 bg-[#0a0a0f]">
            <div className="flex items-center justify-between">
              <h3 className="font-mono font-medium text-sm text-cyan-400 uppercase">
                {t('history')}
              </h3>
              <button
                onClick={handleNewChat}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-400 text-white font-mono text-xs uppercase hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
              >
                {t('newChat')}
              </button>
            </div>
          </div>

          {isLoadingSessions ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400 mx-auto" />
              <p className="text-xs font-mono text-cyan-100/40 mt-2">{t('loadingHistory')}</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm font-mono text-cyan-100/40">{t('noHistory')}</p>
            </div>
          ) : (
            <div className="divide-y divide-purple-500/10">
              {sessions.map((session) => {
                const isActive = session.id === currentSessionId;
                return (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    disabled={isLoadingSession}
                    className={`w-full p-3 hover:bg-purple-500/10 transition-colors text-left cursor-pointer ${
                      isActive ? 'bg-purple-500/20 border-l-2 border-purple-400' : ''
                    }`}
                    data-testid={isActive ? 'active-session' : 'inactive-session'}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-mono text-cyan-100/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.lastMessageAt).toLocaleString()}
                          </p>
                          {isActive && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-green-500/20 text-green-400 border border-green-500/50" data-testid="active-badge">
                              {t('activeBadge')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-cyan-100/40">
                          {t('sessionStats', { messages: session.messageCount, tokens: session.tokenUsage.total.toLocaleString() })}
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
      <div className="px-4 py-2 bg-[#050508]/50 border-b border-cyan-500/20 text-xs font-mono text-cyan-100/50">
        <span className="text-cyan-400">TOKENS:</span> {tokenCount.toLocaleString()} / 272,000
        {tokenCount > 220000 && (
          <span className="text-yellow-400 ml-2">
            ({t('approachingLimit')})
          </span>
        )}
      </div>

      {/* Error Banner */}
      {showError && error && (
        <div className="px-4 py-3 bg-pink-500/10 border-b border-pink-500/30 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-mono text-pink-400">&gt; ERROR: {error.message}</p>
            <div className="flex items-center gap-2 mt-2">
              {(error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('apikey')) && (
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-mono text-xs uppercase hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
                >
                  {t('addKey')}
                </button>
              )}
              <button
                onClick={() => setShowError(false)}
                className="text-xs font-mono text-pink-400 hover:text-pink-300 cursor-pointer"
              >
                {t('dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-cyan-100/40 mt-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500/30" />
            <p className="text-sm font-mono">
              {t('placeholder')}
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
              className={`max-w-[85%] px-4 py-2 break-words overflow-wrap-anywhere ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500/80 to-purple-400/80 text-white border border-purple-400/50'
                  : 'bg-[#050508]/80 text-cyan-100 border border-cyan-500/30'
              }`}
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {message.role === 'user' ? (
                <p className="text-sm font-mono whitespace-pre-wrap break-words">{message.content}</p>
              ) : (
                <div className="text-sm font-mono break-words">
                  <MarkdownContent content={message.content} className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2 prose-code:text-xs prose-code:bg-cyan-500/20 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-cyan-500/30 prose-pre:break-words prose-code:break-words" />
                </div>
              )}
              {message.toolInvocations && message.toolInvocations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-cyan-500/20">
                  <p className="text-xs font-mono opacity-75 mb-1 text-cyan-400">
                    {t('toolsCalled')}: {message.toolInvocations.length}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(message.toolInvocations as Array<{ toolName?: string }>)
                      .map((inv, idx) => {
                        const toolName = inv.toolName || 'unknown';
                        return (
                          <span
                            key={idx}
                            className="text-xs font-mono bg-green-500/20 text-green-400 px-2 py-0.5 border border-green-500/50"
                          >
                            {toolName}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#050508]/80 border border-purple-500/30 px-4 py-2 flex items-center gap-2" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <p className="text-sm font-mono text-purple-400">{t('processing')}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-500/20 bg-[#050508]/50">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'workflow'
                ? t('describeWorkflow')
                : t('describePrompt')
            }
            className="flex-1 px-3 py-2 bg-[#050508]/50 border border-purple-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)] resize-none transition-all"
            rows={3}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="self-end px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs font-mono text-cyan-100/30 mt-2">
          {t('inputHint')}
        </p>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={() => {
          setShowError(false);
        }}
      />
    </div>
  );
}
