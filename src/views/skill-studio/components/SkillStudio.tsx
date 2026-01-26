'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { SkillHeader } from './SkillHeader';
import { SkillEditor } from './SkillEditor';
import { SkillMetadataForm } from './SkillMetadataForm';
import { AttachmentPanel } from './AttachmentPanel';
import { FileExplorer } from './FileExplorer';
import { ChatSidebar } from '@/features/ai-assistant/components/ChatSidebar';
import { useSkillStudio, SkillInitialData } from '../hooks/useSkillStudio';
import { WorkflowContext } from '@/types/ai-chat';
import { AlertCircle } from 'lucide-react';

interface SkillStudioProps {
  initialData?: SkillInitialData | null;
  readOnly?: boolean;
}

export function SkillStudio({ initialData, readOnly = false }: SkillStudioProps) {
  const t = useTranslations('skillStudio');
  const router = useRouter();
  const [showAIChat, setShowAIChat] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const {
    name,
    setName,
    description,
    setDescription,
    content,
    setContent,
    visibility,
    setVisibility,
    selectedTagIds,
    setSelectedTagIds,
    selectedModelIds,
    setSelectedModelIds,
    attachments,
    isDirty,
    saveStatus,
    error,
    setError,
    skillId,
    handleSave,
    handleUploadAttachment,
    handleDeleteAttachment,
    uploadProgress,
  } = useSkillStudio({
    initialData,
    onSaveSuccess: (id) => {
      // Update URL for new skills after first save
      if (!initialData) {
        router.replace(`/dashboard/skills/${id}/edit`);
      }
    },
  });

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const scrollToEditor = useCallback(() => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Build AI context for skill mode
  const skillContext = useMemo((): WorkflowContext => ({
    currentSkill: skillId ? { id: skillId, name, description, content } : undefined,
    mode: 'skill',
  }), [skillId, name, description, content]);

  return (
    <div className="flex flex-col h-screen bg-[#050508]">
      {/* Header */}
      <SkillHeader
        name={name}
        isDirty={isDirty}
        isSaving={saveStatus === 'saving'}
        saveStatus={saveStatus}
        readOnly={readOnly}
        showAIChat={showAIChat}
        onSave={handleSave}
        onToggleAIChat={() => setShowAIChat(!showAIChat)}
      />

      {/* Error banner */}
      {error && (
        <div className="px-6 py-3 bg-pink-500/10 border-b border-pink-500/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />
          <p className="text-sm font-mono text-pink-400">&gt; {error}</p>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main editor panel */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${showAIChat ? 'mr-96' : ''}`}>
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
            {/* File Explorer */}
            <FileExplorer
              content={content}
              attachments={attachments}
              onScrollToEditor={scrollToEditor}
            />

            {/* Metadata form */}
            <div className="border border-cyan-500/30 bg-[#0a0a0f]/50 p-4">
              <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">
                {t('metadata')}
              </h3>
              <SkillMetadataForm
                visibility={visibility}
                selectedTagIds={selectedTagIds}
                selectedModelIds={selectedModelIds}
                readOnly={readOnly}
                onVisibilityChange={setVisibility}
                onTagIdsChange={setSelectedTagIds}
                onModelIdsChange={setSelectedModelIds}
              />
            </div>

            {/* Editor section */}
            <div ref={editorRef}>
              <SkillEditor
                name={name}
                description={description}
                content={content}
                readOnly={readOnly}
                onNameChange={setName}
                onDescriptionChange={setDescription}
                onContentChange={setContent}
              />
            </div>

            {/* Attachments */}
            <div className="border border-cyan-500/30 bg-[#0a0a0f]/50 p-4">
              <AttachmentPanel
                attachments={attachments}
                uploadProgress={uploadProgress}
                readOnly={readOnly}
                skillId={skillId}
                onUpload={handleUploadAttachment}
                onDelete={handleDeleteAttachment}
                onValidationError={setError}
              />
            </div>

            {/* Bottom padding */}
            <div className="h-8" />
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <ChatSidebar
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          mode="skill"
          workflowContext={skillContext}
        />
      </div>
    </div>
  );
}
