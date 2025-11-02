import Link from 'next/link';
import { ROUTES } from '@/shared/routes';

/**
 * Create Workflow Step
 *
 * Demonstrates workflow constructor
 * Shows how to build workflows visually
 */
export function CreateWorkflowStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Custom Workflows
        </h2>
        <p className="text-gray-600">
          Build workflows visually with our drag-and-drop constructor
        </p>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-sm">
                1
              </div>
              <h4 className="font-semibold text-gray-900">Create Stages</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Organize your workflow into logical phases like &quot;Analysis&quot;, &quot;Design&quot;, &quot;Implementation&quot;
            </p>
          </div>

          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600 font-bold text-sm">
                2
              </div>
              <h4 className="font-semibold text-gray-900">Drag Mini-Prompts</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Drag mini-prompts from your library into stages. Reorder them to define execution sequence.
            </p>
          </div>

          <div className="flex justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 font-bold text-sm">
                3
              </div>
              <h4 className="font-semibold text-gray-900">Configure & Save</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              Set complexity, tags, and visibility (PUBLIC/PRIVATE). Save to use with MCP server.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Best Practice</h4>
            <p className="text-sm text-blue-800">
              Assign <strong>one agent per stage</strong> to prevent context collapse.
              Use review steps between stages to maintain clarity and allow validation before proceeding.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">Context Management</h4>
            <p className="text-sm text-purple-800 mb-3">
              Keep AI agents aligned across workflow stages with automatic mini-prompts:
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-purple-900">Memory Board (📋):</strong>
                <span className="text-gray-700 ml-1">
                  Enable &quot;With Review&quot; on stages to add handoff review prompts
                </span>
              </div>
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-purple-900">Multi-Agent Chat (🤖):</strong>
                <span className="text-gray-700 ml-1">
                  Enable globally to add coordination chat after each mini-prompt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900 mb-1">✨ Real-time Preview</p>
          <p className="text-blue-700 text-xs">See your workflow structure as you build</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="font-medium text-purple-900 mb-1">🎯 Smart Validation</p>
          <p className="text-purple-700 text-xs">Ensures all required fields are complete</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-semibold text-violet-900 mb-2">AI Assistant</h4>
            <p className="text-sm text-violet-800 mb-3">
              Need help creating your workflow? Use the built-in AI assistant to:
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-violet-900">Generate Workflows:</strong>
                <span className="text-gray-700 ml-1">
                  Describe your task and get a complete workflow structure
                </span>
              </div>
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-violet-900">Create Mini-Prompts:</strong>
                <span className="text-gray-700 ml-1">
                  Ask AI to write custom prompts for specific tasks
                </span>
              </div>
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-violet-900">Get Recommendations:</strong>
                <span className="text-gray-700 ml-1">
                  Receive suggestions for improving workflow structure
                </span>
              </div>
            </div>
            <p className="text-xs text-violet-700 mt-3 italic">
              💡 The AI assistant is available in the workflow constructor and library sections
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Try the workflow constructor
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Create your first custom workflow with AI assistance
            </p>
          </div>
          <Link
            href={ROUTES.LIBRARY.WORKFLOWS.NEW}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Create Workflow
          </Link>
        </div>
      </div>
    </div>
  );
}
