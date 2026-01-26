'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/shared/ui/atoms/Modal';
import { CopyButton } from '@/shared/ui/molecules';
import { Download, X } from 'lucide-react';
import { SkillAttachment } from '../hooks/useSkillStudio';
import { formatFileSize, isImageMimeType, isTextMimeType } from '@/shared/lib/utils';

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: SkillAttachment | null;
  content?: string | null;
  blobUrl?: string | null;
}

export function AttachmentPreviewModal({
  isOpen,
  onClose,
  attachment,
  content,
  blobUrl,
}: AttachmentPreviewModalProps) {
  const t = useTranslations('skillStudio');

  if (!attachment) return null;

  const isImage = isImageMimeType(attachment.mimeType);
  const isText = isTextMimeType(attachment.mimeType);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl max-h-[85vh] overflow-y-auto">
      <div className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider truncate" style={{ textShadow: '0 0 10px #00ffff40' }}>
            {attachment.fileName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cyan-500/10 transition-colors text-cyan-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4 text-xs font-mono text-cyan-100/50">
          <span>{attachment.mimeType}</span>
          <span>{formatFileSize(attachment.fileSize)}</span>
        </div>

        {/* Content */}
        <div className="border border-cyan-500/30 bg-[#050508]/50">
          {isImage && blobUrl ? (
            <div className="flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blobUrl}
                alt={attachment.fileName}
                className="max-w-full max-h-[500px] object-contain"
              />
            </div>
          ) : isText && content ? (
            <div className="relative">
              <div className="absolute top-2 right-2">
                <CopyButton
                  textToCopy={content}
                  label={t('copy')}
                  variant="secondary"
                  size="sm"
                />
              </div>
              <pre className="p-4 text-sm font-mono text-cyan-100 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                {content}
              </pre>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-mono text-cyan-100/50 mb-4">
                {t('binaryPreview')}
              </p>
              {blobUrl && (
                <a
                  href={blobUrl}
                  download={attachment.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-mono text-sm uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
                >
                  <Download className="w-4 h-4" />
                  {t('download')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
