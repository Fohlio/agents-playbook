'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/shared/ui/atoms/Modal';
import Button from '@/shared/ui/atoms/Button';
import { PromptWithMeta } from '@/server/folders/types';
import { useState } from 'react';

interface PromptPreviewModalProps {
  prompt: PromptWithMeta | null;
  onClose: () => void;
}

/**
 * PromptPreviewModal Component
 *
 * Modal for previewing prompt content with copy functionality.
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
          <h3 className="text-lg font-semibold text-gray-900">{prompt.name}</h3>
          {prompt.description && (
            <p className="text-sm text-gray-500 mt-1">{prompt.description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {prompt.user.username}
        </span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          prompt.visibility === 'PUBLIC'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {prompt.visibility === 'PUBLIC' ? tCommon('public') : tCommon('private')}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
          {prompt.content}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          {tCommon('close')}
        </Button>
        <Button variant="primary" onClick={handleCopy}>
          {copied ? tCommon('copied') : t('copy')}
        </Button>
      </div>
    </Modal>
  );
}
