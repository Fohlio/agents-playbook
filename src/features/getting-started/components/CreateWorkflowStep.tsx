import Link from 'next/link';
import { LIBRARY_ROUTES } from '@/shared/routes';

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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Try the workflow constructor
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Create your first custom workflow
            </p>
          </div>
          <Link
            href={LIBRARY_ROUTES.WORKFLOWS.NEW}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Create Workflow
          </Link>
        </div>
      </div>
    </div>
  );
}
