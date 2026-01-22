'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { USAGE_HINT_TEMPLATE } from '@/shared/lib/constants/usage-hint';

type TabId = 'discovery' | 'library' | 'workflows' | 'mcp' | 'sharing';

/**
 * Docs Step - Cyberpunk Style
 */
export function DocsStep() {
  const t = useTranslations('docsStep');
  const [activeTab, setActiveTab] = useState<TabId>('discovery');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'discovery', label: t('tabs.discovery'), icon: '' },
    { id: 'library', label: t('tabs.library'), icon: '' },
    { id: 'workflows', label: t('tabs.workflows'), icon: '' },
    { id: 'mcp', label: t('tabs.mcp'), icon: '' },
    { id: 'sharing', label: t('tabs.sharing'), icon: '' }
  ];

  const getDocSections = (tab: TabId) => {
    switch (tab) {
      case 'discovery':
        return {
          title: t('discovery.title'),
          sections: [
            { heading: t('discovery.semanticSearch'), content: t('discovery.semanticSearchDesc') },
            { heading: t('discovery.filters'), content: t('discovery.filtersDesc') },
            { heading: t('discovery.systemVsUser'), content: t('discovery.systemVsUserDesc') }
          ]
        };
      case 'library':
        return {
          title: t('library.title'),
          sections: [
            { heading: t('library.workflows'), content: t('library.workflowsDesc') },
            { heading: t('library.miniPrompts'), content: t('library.miniPromptsDesc') },
            { heading: t('library.activeVsInactive'), content: t('library.activeVsInactiveDesc') },
            { heading: t('library.publicVsPrivate'), content: t('library.publicVsPrivateDesc') }
          ]
        };
      case 'workflows':
        return {
          title: t('workflows.title'),
          sections: [
            { heading: t('workflows.visualConstructor'), content: t('workflows.visualConstructorDesc') },
            { heading: t('workflows.stages'), content: t('workflows.stagesDesc') },
            { heading: t('workflows.miniPrompts'), content: t('workflows.miniPromptsDesc') },
            { heading: t('workflows.complexity'), content: t('workflows.complexityDesc') },
            { heading: t('workflows.tags'), content: t('workflows.tagsDesc') }
          ]
        };
      case 'mcp':
        return {
          title: t('mcp.title'),
          sections: [
            { heading: t('mcp.setupClaudeCode'), content: t('mcp.setupClaudeCodeDesc') },
            { heading: t('mcp.setupCursor'), content: t('mcp.setupCursorDesc') },
            { heading: t('mcp.gettingApiToken'), content: t('mcp.gettingApiTokenDesc') },
            { heading: t('mcp.usage'), content: t('mcp.usageDesc', { hint: USAGE_HINT_TEMPLATE }) },
            { heading: t('mcp.troubleshooting'), content: t('mcp.troubleshootingDesc') }
          ]
        };
      case 'sharing':
        return {
          title: t('sharing.title'),
          sections: [
            { heading: t('sharing.visibilitySettings'), content: t('sharing.visibilitySettingsDesc') },
            { heading: t('sharing.shareLinks'), content: t('sharing.shareLinksDesc') },
            { heading: t('sharing.ratingSystem'), content: t('sharing.ratingSystemDesc') },
            { heading: t('sharing.importing'), content: t('sharing.importingDesc') }
          ]
        };
    }
  };

  const currentDoc = getDocSections(activeTab);

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

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                : 'bg-[#0a0a0f]/50 text-cyan-100/40 border border-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-100/60'
            }`}
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[#050508]/50 border border-cyan-500/30 p-6">
        <h3 className="text-lg font-mono text-cyan-400 uppercase tracking-wider mb-4">{currentDoc.title}</h3>

        <div className="space-y-3">
          {currentDoc.sections.map((section, index) => (
            <div key={index} className="bg-[#0a0a0f] border border-cyan-500/20 p-4">
              <h4 className="font-mono text-cyan-400 uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
                <span className="text-pink-400">▸</span>
                {section.heading}
              </h4>
              <p className="text-cyan-100/50 font-mono text-xs leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">*</span>
          <div className="text-sm font-mono">
            <p className="text-yellow-400 uppercase tracking-wider mb-1">
              {t('proTip')}
            </p>
            <p className="text-cyan-100/50 text-xs">
              {t('proTipContent')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
