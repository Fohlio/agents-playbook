'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/shared/ui/atoms/Modal';
import { PromptWithMeta } from '@/server/folders/types';
import { useState } from 'react';

interface PromptPreviewModalProps {
  prompt: PromptWithMeta | null;
  onClose: () => void;
}

/**
 * PromptPreviewModal Component - Cyberpunk Style
 */
export function PromptPreviewModal({ prompt, onClose }: PromptPreviewModalProps) {
  const t = useTranslations('miniPromptCard');
  const tCommon = useTranslations('common');
  const [copied, setCopied] = useState(false);

  if (!prompt) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      testId="prompt-preview-modal"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-mono font-bold text-pink-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #ff006640' }}>
            {prompt.name}
          </h3>
          {prompt.description && (
            <p className="text-sm text-cyan-100/50 font-mono mt-1">{prompt.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm font-mono text-cyan-100/50 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-purple-400">@{prompt.user.username}</span>
        </span>
        <span className={`px-2 py-0.5 text-xs font-mono uppercase border ${
          prompt.visibility === 'PUBLIC'
            ? 'bg-green-500/10 text-green-400 border-green-500/50'
            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50'
        }`}>
          {prompt.visibility === 'PUBLIC' ? tCommon('public') : tCommon('private')}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#050508]/50 border border-cyan-500/30 p-4 mb-4">
        <pre className="text-sm text-cyan-100/80 whitespace-pre-wrap font-mono">
          {prompt.content}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
        >
          {tCommon('close')}
        </button>
        <button
          onClick={handleCopy}
          className={`px-6 py-2.5 font-bold uppercase tracking-wider text-sm transition-all cursor-pointer ${
            copied 
              ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-[#050508] hover:shadow-[0_0_20px_rgba(0,255,0,0.4)]'
              : 'bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:shadow-[0_0_20px_rgba(255,0,102,0.4)]'
          }`}
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        >
          {copied ? tCommon('copied') : t('copy')}
        </button>
      </div>
    </Modal>
  );
}
