'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';
import { USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

/**
 * MCP Integration Step - Cyberpunk Style
 */
export function MCPIntegrationStep() {
  const t = useTranslations('gettingStarted.mcpIntegration');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-mono text-cyan-400 mb-2" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {t('title')}
        </h2>
        <p className="text-cyan-100/60 font-mono text-sm">
          {t('subtitle')}
        </p>
      </div>

      {/* Token optional note */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="text-sm font-mono">
            <p className="text-cyan-400 uppercase tracking-wider mb-1">
              {t('tokenOptional')}
            </p>
            <p className="text-cyan-100/50 text-xs">
              {t('tokenOptionalDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Claude Code */}
        <div 
          className="bg-[#050508]/50 border border-orange-500/30 p-5"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-mono text-orange-400 uppercase tracking-wider">{t('claudeCode')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-cyan-100/50 font-mono text-xs">{t('addToSettings')}</p>
            <pre className="bg-[#0a0a0f] border border-orange-500/20 p-3 overflow-x-auto">
              <code className="text-green-400 font-mono text-xs">
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
        <div 
          className="bg-[#050508]/50 border border-blue-500/30 p-5"
          style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="text-lg font-mono text-blue-400 uppercase tracking-wider">{t('cursor')}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-cyan-100/50 font-mono text-xs">{t('addToConfig')}</p>
            <pre className="bg-[#0a0a0f] border border-blue-500/20 p-3 overflow-x-auto">
              <code className="text-green-400 font-mono text-xs">
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

      {/* Get Token */}
      <div className="bg-green-500/10 border border-green-500/30 p-5">
        <h4 className="font-mono text-green-400 uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
          <span>🔑</span>
          <span>{t('getToken')}</span>
        </h4>
        <p className="text-xs text-cyan-100/50 font-mono mb-3">
          {t('getTokenDesc')}
        </p>
        <ol className="space-y-2 text-xs text-cyan-100/60 font-mono">
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">01.</span>
            <span>{t('step1')}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">02.</span>
            <span>{t('step2')}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">03.</span>
            <span>{t('step3')}</span>
          </li>
        </ol>
        <Link
          href={ROUTES.SETTINGS}
          className="mt-3 inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-400 text-[#050508] font-bold uppercase tracking-wider text-xs hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] transition-all cursor-pointer"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
        >
          {t('getApiToken')}
        </Link>
      </div>

      {/* Usage Example */}
      <div className="bg-[#0a0a0f] border border-cyan-500/30 p-5">
        <h4 className="font-mono text-cyan-400 uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
          <span>💬</span>
          <span>{t('usageExample')}</span>
        </h4>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-cyan-100/40 font-mono text-xs mb-2">{t('usageInstructions')}</p>
            <div className="bg-[#050508] border border-cyan-500/20 p-3 font-mono text-green-400 text-xs">
              {USAGE_HINT_TEMPLATE.replace('[workflow-name]', 'feature-development workflow')}
            </div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 p-3">
            <p className="text-xs text-cyan-100/50 font-mono">
              {t('usageNote')}
            </p>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">📚</span>
          <div className="text-sm font-mono">
            <p className="text-yellow-400 uppercase tracking-wider mb-1">
              {t('needHelp')}
            </p>
            <p className="text-cyan-100/50 text-xs">
              {t('needHelpDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
