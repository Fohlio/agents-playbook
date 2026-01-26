'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, FileText, Paperclip } from 'lucide-react';
import { SkillAttachment } from '../hooks/useSkillStudio';
import { formatFileSize } from '@/shared/lib/utils';

interface FileExplorerProps {
  content: string;
  attachments: SkillAttachment[];
  onScrollToEditor?: () => void;
  onSelectAttachment?: (attachment: SkillAttachment) => void;
}

export function FileExplorer({
  content,
  attachments,
  onScrollToEditor,
  onSelectAttachment,
}: FileExplorerProps) {
  const t = useTranslations('skillStudio');
  const [isExpanded, setIsExpanded] = useState(true);

  const totalFiles = 1 + attachments.length; // SKILL.md + attachments
  const contentSize = useMemo(() => new Blob([content]).size, [content]);

  return (
    <div className="border border-cyan-500/30 bg-[#050508]/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cyan-500/5 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
        aria-label={t('fileExplorer')}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-cyan-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-cyan-400" />
        )}
        <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex-1 text-left">
          {t('fileExplorer')}
        </span>
        <span className="text-xs font-mono text-cyan-100/40">
          {totalFiles} {t('files')}
        </span>
      </button>

      {/* File tree */}
      {isExpanded && (
        <div className="border-t border-cyan-500/20">
          {/* SKILL.md entry */}
          <button
            onClick={onScrollToEditor}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cyan-500/10 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-green-400/70 ml-4" />
            <span className="text-sm font-mono text-cyan-100/80 flex-1 text-left">
              SKILL.md
            </span>
            <span className="text-xs font-mono text-cyan-100/40">
              {formatFileSize(contentSize)}
            </span>
          </button>

          {/* Attachments folder */}
          {attachments.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400/50 ml-4" />
                <span className="text-xs font-mono text-cyan-100/50 uppercase">
                  {t('attachments')}/
                </span>
              </div>
              {attachments.map((attachment) => (
                <button
                  key={attachment.id}
                  onClick={() => onSelectAttachment?.(attachment)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400/40 ml-8" />
                  <span className="text-sm font-mono text-cyan-100/70 flex-1 text-left truncate">
                    {attachment.fileName}
                  </span>
                  <span className="text-xs font-mono text-cyan-100/30">
                    {formatFileSize(attachment.fileSize)}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
