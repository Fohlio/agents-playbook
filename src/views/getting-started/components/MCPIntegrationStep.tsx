import Link from 'next/link';
import { ROUTES } from '@/shared/routes';
import { USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

/**
 * MCP Integration Step
 *
 * Shows how to integrate with Claude Code and Cursor
 * Provides setup instructions and usage examples
 */
export function MCPIntegrationStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          MCP Server Integration
        </h2>
        <p className="text-gray-600">
          Connect Agents Playbook to Claude Code and Cursor
        </p>
      </div>

      {/* Token optional note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              API Token is Optional
            </p>
            <p className="text-blue-800">
              Without a token, you&apos;ll have access to all system workflows. Add your API token to also access your personal library workflows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Claude Code */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Claude Code</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">Add to your MCP settings:</p>
            <pre className="bg-gray-900 rounded border border-orange-200 p-3 overflow-x-auto">
              <code className="text-green-400 text-xs">
{`{
  "agents-playbook": {
    "url": "https://agents-playbook.com/api/v1/mcp",
    "headers": {
      "Authorization": "Bearer your-api-token"
    }
  }
}`}
              </code>
            </pre>
          </div>
        </div>

        {/* Cursor */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Cursor</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">Add to MCP configuration:</p>
            <pre className="bg-gray-900 rounded border border-blue-200 p-3 overflow-x-auto">
              <code className="text-green-400 text-xs">
{`{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "description": "AI Agent Workflow Engine",
      "headers": {
        "Authorization": "Bearer your-api-token"
      }
    }
  }
}`}
              </code>
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span>🔑</span>
          <span>Get Your API Token (Optional)</span>
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          To access your personal library workflows, create an API token:
        </p>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600">1.</span>
            <span>Go to Settings → API Tokens</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600">2.</span>
            <span>Click &quot;Create New Token&quot;</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600">3.</span>
            <span>Copy the token and add it to your MCP config</span>
          </li>
        </ol>
        <Link
          href={ROUTES.SETTINGS}
          className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          Get API Token
        </Link>
      </div>

      <div className="bg-gray-900 rounded-lg p-5 text-white">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span>💬</span>
          <span>Usage Example</span>
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-400 mb-1">In Claude Code or Cursor, type:</p>
            <div className="bg-black rounded p-3 font-mono text-green-400">
              {USAGE_HINT_TEMPLATE.replace('[workflow-name]', 'feature-development workflow')}
            </div>
          </div>
          <div className="bg-blue-900/30 rounded p-3 text-blue-100">
            <p className="text-xs">
              The AI will load your workflow and guide you step-by-step through
              requirements, design, implementation, and testing.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📚</span>
          <div className="text-sm">
            <p className="font-medium text-yellow-900 mb-1">
              Need detailed setup instructions?
            </p>
            <p className="text-yellow-800">
              Visit our documentation for step-by-step guides and troubleshooting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
