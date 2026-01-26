'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, useCallback } from 'react';
import { Upload, Trash2, FileText, Image, File as FileIcon } from 'lucide-react';
import { SkillAttachment } from '../hooks/useSkillStudio';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { formatFileSize, getMimeCategory } from '@/shared/lib/utils';

interface AttachmentPanelProps {
  attachments: SkillAttachment[];
  uploadProgress: Record<string, number>;
  readOnly?: boolean;
  skillId: string | null;
  onUpload: (file: File) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  onValidationError?: (message: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

const MIME_ICONS = {
  image: Image,
  text: FileText,
  binary: FileIcon,
} as const;

function getFileIcon(mimeType: string) {
  return MIME_ICONS[getMimeCategory(mimeType)];
}

export function AttachmentPanel({
  attachments,
  uploadProgress,
  readOnly,
  skillId,
  onUpload,
  onDelete,
  onValidationError,
}: AttachmentPanelProps) {
  const t = useTranslations('skillStudio');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<SkillAttachment | null>(null);

  const totalSize = attachments.reduce((sum, a) => sum + a.fileSize, 0);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        onValidationError?.(`File "${file.name}" exceeds 10MB limit`);
        continue;
      }
      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        onValidationError?.('Total attachment size would exceed 50MB limit');
        break;
      }
      await onUpload(file);
    }
  }, [onUpload, totalSize, onValidationError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const hasUploads = Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
          {t('attachments')} ({attachments.length})
        </h3>
        <span className="text-xs font-mono text-cyan-100/40">
          {formatFileSize(totalSize)} / 50 MB
        </span>
      </div>

      {/* Drop zone */}
      {!readOnly && (
        <div
          role="button"
          tabIndex={skillId ? 0 : undefined}
          aria-label={t('dropFiles')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => skillId && fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (skillId) { fileInputRef.current?.click(); } } }}
          className={`
            border-2 border-dashed p-4 text-center transition-all
            ${!skillId ? 'opacity-50 cursor-not-allowed border-cyan-500/20' : 'cursor-pointer'}
            ${isDragOver
              ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
              : 'border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5'
            }
          `}
        >
          <Upload className="w-6 h-6 text-cyan-400/60 mx-auto mb-2" />
          <p className="text-xs font-mono text-cyan-100/50">
            {skillId ? t('dropFiles') : t('saveFirst')}
          </p>
          <p className="text-xs font-mono text-cyan-100/30 mt-1">
            {t('uploadLimit')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={!skillId}
          />
        </div>
      )}

      {/* Upload progress indicators */}
      {hasUploads && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-[#050508] border border-cyan-500/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-cyan-400">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {attachments.length > 0 && (
        <div className="space-y-1">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.mimeType);
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 bg-[#050508]/30 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group"
              >
                <Icon className="w-4 h-4 text-cyan-400/60 flex-shrink-0" />
                <button
                  onClick={() => setPreviewAttachment(attachment)}
                  className="flex-1 text-left text-sm font-mono text-cyan-100/80 hover:text-cyan-100 truncate cursor-pointer"
                >
                  {attachment.fileName}
                </button>
                <span className="text-xs font-mono text-cyan-100/40 flex-shrink-0">
                  {formatFileSize(attachment.fileSize)}
                </span>
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(attachment.id);
                    }}
                    className="p-1 text-pink-400/50 hover:text-pink-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    aria-label={t('deleteAttachment')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Attachment Preview Modal */}
      <AttachmentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
      />
    </div>
  );
}
