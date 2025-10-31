import Link from 'next/link';
import { ROUTES } from '@/shared/routes';

/**
 * Library Step
 *
 * Explains Library functionality
 * Shows difference between workflows and mini-prompts
 */
export function LibraryStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Library
        </h2>
        <p className="text-gray-600">
          Organize workflows and mini-prompts for your projects
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Workflows Card */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Workflows</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Complete multi-step processes with defined stages and execution order.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Multiple stages (Analysis, Design, Implementation)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Contains multiple mini-prompts per stage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Smart step skipping based on context</span>
            </li>
          </ul>
        </div>

        {/* Mini-Prompts Card */}
        <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Mini-Prompts</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Reusable prompt templates for specific tasks and operations.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Single-purpose instructions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Reusable across multiple workflows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Markdown format with examples</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Pro Tip: Start with workflows
            </p>
            <p className="text-xs text-gray-700">
              Import proven workflows from Discover, then create custom mini-prompts
              as you identify repeated patterns in your work.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Manage your library
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Create, edit, and organize workflows
            </p>
          </div>
          <Link
            href={ROUTES.LIBRARY}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Go to Library
          </Link>
        </div>
      </div>
    </div>
  );
}
