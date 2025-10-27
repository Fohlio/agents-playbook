"use client";

import { Modal, Button, Badge } from "@/shared/ui/atoms";
import { PublicWorkflowWithMeta } from "@/features/public-discovery/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WorkflowPreviewModalProps {
  workflow: PublicWorkflowWithMeta;
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  isAuthenticated: boolean;
  isImporting?: boolean;
  isOwnWorkflow?: boolean;
}

export function WorkflowPreviewModal({
  workflow,
  isOpen,
  onClose,
  onImport,
  isAuthenticated,
  isImporting,
  isOwnWorkflow,
}: WorkflowPreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
      testId="workflow-preview-modal"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {workflow.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                @{workflow.user.username}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {workflow._count.references} {workflow._count.references === 1 ? 'user' : 'users'}
              </span>
              {workflow.averageRating && (
                <Badge variant="default">
                  ★ {workflow.averageRating.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {workflow.description || "No description available"}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Stages ({workflow._count.stages})
          </h3>
          {!workflow.stages || workflow.stages.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No stages defined yet</p>
          ) : (
            <div className="space-y-4">
              {workflow.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="p-5 rounded-lg border border-gray-200 bg-white shadow-sm"
                  style={{ borderLeftColor: stage.color || '#64748b', borderLeftWidth: '4px' }}
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Stage {index + 1}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{stage.name}</h4>
                    {stage.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">{stage.description}</p>
                    )}
                  </div>

                  {stage.miniPrompts && stage.miniPrompts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Mini-Prompts ({stage.miniPrompts.length})
                      </p>
                      <div className="space-y-3">
                        {stage.miniPrompts.map((smp) => (
                          <div key={smp.miniPromptId} className="p-3 rounded-md bg-gray-50 border border-gray-100">
                            <h5 className="font-semibold text-sm text-gray-900 mb-1">
                              {smp.miniPrompt.name}
                            </h5>
                            <div className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {smp.miniPrompt.content || "No prompt text available"}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {!isOwnWorkflow && (
            <Button
              variant={workflow.isInUserLibrary ? "secondary" : "primary"}
              onClick={() => {
                onImport();
                onClose();
              }}
              disabled={workflow.isInUserLibrary || isImporting}
            >
              {workflow.isInUserLibrary
                ? "In Library"
                : isAuthenticated
                  ? "Add to Library"
                  : "Login to Import"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
