'use client';

import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ExecutionPlan } from '@/types/ai-chat';

interface ExecutionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  executionPlan: ExecutionPlan | null;
}

export function ExecutionPlanModal({
  isOpen,
  onClose,
  onApprove,
  executionPlan,
}: ExecutionPlanModalProps) {
  if (!isOpen || !executionPlan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Review Execution Plan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-gray-600 mb-4">
            The AI assistant has proposed the following changes. Please review them
            carefully before approving.
          </p>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Summary</h3>
            <p className="text-sm text-blue-800">{executionPlan.summary}</p>
          </div>

          {/* Execution Items */}
          <div className="space-y-3">
            {executionPlan.items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {item.toolName}
                    </h4>
                    <p className="text-sm text-gray-600">{item.description}</p>

                    {/* Show tool data details */}
                    {item.data.workflow && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Workflow:</strong> {item.data.workflow.name}
                        {item.data.workflow.stages && (
                          <span className="ml-2">
                            ({item.data.workflow.stages.length} stage(s))
                          </span>
                        )}
                      </div>
                    )}

                    {item.data.stage && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Stage:</strong> {item.data.stage.name}
                        {item.data.stage.position !== undefined && (
                          <span className="ml-2">
                            (Position: {item.data.stage.position})
                          </span>
                        )}
                      </div>
                    )}

                    {item.data.miniPrompt && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Mini-Prompt:</strong> {item.data.miniPrompt.name}
                      </div>
                    )}

                    {item.data.stageIndex !== undefined && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Stage Index:</strong> {item.data.stageIndex}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> These changes will modify your workflow or
              mini-prompt. Make sure you review all details before approving.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApprove();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve & Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
