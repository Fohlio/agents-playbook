import Link from 'next/link';
import { ROUTES } from '@/shared/routes';

/**
 * Discover Step
 *
 * Explains Discover page functionality
 * Shows how to find and explore workflows
 */
export function DiscoverStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Discover Workflows
        </h2>
        <p className="text-gray-600">
          Explore our library of battle-tested workflows designed by experts
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Search & Filter</h3>
            <p className="text-sm text-gray-600">
              Use semantic search to find workflows by describing your problem.
              Filter by complexity, tags, and ratings.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Preview & Rate</h3>
            <p className="text-sm text-gray-600">
              Click any workflow to see its stages and mini-prompts.
              Rate workflows to help the community find the best solutions.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Import to Library</h3>
            <p className="text-sm text-gray-600">
              Found a workflow you like? Import it to your library with one click.
              Customize it later to fit your needs.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Ready to explore?
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Visit Discover page to browse workflows
            </p>
          </div>
          <Link
            href={ROUTES.DISCOVER}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Go to Discover
          </Link>
        </div>
      </div>
    </div>
  );
}
