'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';
import { USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

/**
 * MCP Integration Step
 *
 * Shows how to integrate with Claude Code and Cursor
 * Provides setup instructions and usage examples
 */
export function MCPIntegrationStep() {
  const t = useTranslations('gettingStarted.mcpIntegration');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      {/* Token optional note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              {t('tokenOptional')}
            </p>
            <p className="text-blue-800">
              {t('tokenOptionalDesc')}
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
            <h3 className="text-lg font-bold text-gray-900">{t('claudeCode')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">{t('addToSettings')}</p>
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
            <h3 className="text-lg font-bold text-gray-900">{t('cursor')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700 font-medium">{t('addToConfig')}</p>
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
          <span>{t('getToken')}</span>
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          {t('getTokenDesc')}
        </p>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600">1.</span>
            <span>{t('step1')}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600">2.</span>
            <span>{t('step2')}</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600">3.</span>
            <span>{t('step3')}</span>
          </li>
        </ol>
        <Link
          href={ROUTES.SETTINGS}
          className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          {t('getApiToken')}
        </Link>
      </div>

      <div className="bg-gray-900 rounded-lg p-5 text-white">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span>💬</span>
          <span>{t('usageExample')}</span>
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-400 mb-1">{t('usageInstructions')}</p>
            <div className="bg-black rounded p-3 font-mono text-green-400">
              {USAGE_HINT_TEMPLATE.replace('[workflow-name]', 'feature-development workflow')}
            </div>
          </div>
          <div className="bg-blue-900/30 rounded p-3 text-blue-100">
            <p className="text-xs">
              {t('usageNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📚</span>
          <div className="text-sm">
            <p className="font-medium text-yellow-900 mb-1">
              {t('needHelp')}
            </p>
            <p className="text-yellow-800">
              {t('needHelpDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
