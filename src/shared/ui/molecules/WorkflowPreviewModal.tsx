"use client";

import { Modal, Button, Badge } from "@/shared/ui/atoms";
import { PublicWorkflowWithMeta } from "@/views/discover/types";
import { MarkdownContent } from "@/shared/ui/atoms/MarkdownContent";
import { KeyDisplay } from "@/shared/ui/molecules";
import { useEffect, useState } from "react";

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
  const [fullWorkflow, setFullWorkflow] = useState(workflow);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && (!workflow.stages || workflow.stages.length === 0) && workflow._count.stages > 0) {
      setIsLoadingDetails(true);
      // Use public endpoint for unauthenticated users, authenticated endpoint otherwise
      const endpoint = isAuthenticated 
        ? `/api/workflows/${workflow.id}/details`
        : `/api/public/workflows/${workflow.id}/details`;
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          setFullWorkflow({ ...workflow, ...data });
          setIsLoadingDetails(false);
        })
        .catch(err => {
          console.error('Failed to fetch workflow details:', err);
          setIsLoadingDetails(false);
        });
    } else {
      setFullWorkflow(workflow);
    }
  }, [isOpen, workflow, isAuthenticated]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
      testId="fullWorkflow-preview-modal"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {fullWorkflow.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                @{fullWorkflow.user.username}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {fullWorkflow._count.references} {fullWorkflow._count.references === 1 ? 'user' : 'users'}
              </span>
              {fullWorkflow.averageRating && (
                <Badge variant="default">
                  ★ {fullWorkflow.averageRating.toFixed(1)}
                </Badge>
              )}
              {fullWorkflow.key && (
                <KeyDisplay keyValue={fullWorkflow.key} />
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
            {fullWorkflow.description || "No description available"}
          </p>
          {fullWorkflow.includeMultiAgentChat && (
            <div className="mt-3">
              <Badge variant="default">
                🤖 Multi-Agent Chat Enabled
              </Badge>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Stages ({fullWorkflow._count.stages})
          </h3>
          {isLoadingDetails ? (
            <p className="text-sm text-gray-500 italic">Loading stages...</p>
          ) : !fullWorkflow.stages || fullWorkflow.stages.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No stages defined yet</p>
          ) : (
            <div className="space-y-4">
              {fullWorkflow.stages.map((stage, index) => (
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
                      {stage.withReview && (
                        <Badge variant="default">
                          📋 With Review
                        </Badge>
                      )}
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
                            <div className="text-xs text-gray-600 leading-relaxed">
                              <MarkdownContent 
                                content={smp.miniPrompt.content || "No prompt text available"}
                                className="prose prose-sm max-w-none"
                              />
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
              variant={fullWorkflow.isInUserLibrary ? "secondary" : "primary"}
              onClick={() => {
                onImport();
                onClose();
              }}
              disabled={fullWorkflow.isInUserLibrary || isImporting}
            >
              {fullWorkflow.isInUserLibrary
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
