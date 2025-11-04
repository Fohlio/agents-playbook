'use client';

import { useState } from 'react';

/**
 * Docs Step
 *
 * Provides essential documentation in an easy-to-read format
 * Covers discovery, library management, workflows, MCP, and sharing
 */
export function DocsStep() {
  const [activeTab, setActiveTab] = useState<'discovery' | 'library' | 'workflows' | 'mcp' | 'sharing'>('discovery');

  const docs = {
    discovery: {
      title: '🔍 Finding Workflows',
      sections: [
        {
          heading: 'Semantic Search',
          content: 'Describe what you need in natural language. Our AI-powered search understands intent, not just keywords.'
        },
        {
          heading: 'Filters',
          content: 'Narrow results by complexity (XS-XL), rating (3-5 stars), usage count, tags, and number of stages.'
        },
        {
          heading: 'System vs User Workflows',
          content: 'System workflows are curated by the platform. User workflows are community-contributed.'
        }
      ]
    },
    library: {
      title: '📚 Managing Your Library',
      sections: [
        {
          heading: 'Workflows',
          content: 'Multi-stage processes with mini-prompts. Create custom workflows or import from Discovery.'
        },
        {
          heading: 'Mini-Prompts',
          content: 'Reusable prompt templates for specific tasks. Drag them into workflow stages.'
        },
        {
          heading: 'Active vs Inactive',
          content: 'Only active workflows appear in your MCP server. Toggle status to control availability.'
        },
        {
          heading: 'Public vs Private',
          content: 'Public workflows appear in Discovery for all users. Private workflows are only visible to you.'
        }
      ]
    },
    workflows: {
      title: '🏗️ Building Workflows',
      sections: [
        {
          heading: 'Visual Constructor',
          content: 'Drag-and-drop interface. Create stages, add mini-prompts, and organize your workflow visually.'
        },
        {
          heading: 'Stages',
          content: 'Organize workflow into phases like Analysis, Design, Implementation, Testing, Review.'
        },
        {
          heading: 'Mini-Prompts',
          content: 'Drag mini-prompts from your library into stages. Reorder them by dragging.'
        },
        {
          heading: 'Complexity',
          content: 'Set T-shirt size: XS (quick fix), S (simple), M (moderate), L (complex), XL (advanced).'
        },
        {
          heading: 'Tags',
          content: 'Categorize workflows for discovery (Testing, Security, Refactoring, etc.).'
        }
      ]
    },
    mcp: {
      title: '🔌 MCP Integration',
      sections: [
        {
          heading: 'Setup for Claude Code',
          content: 'Add configuration to your MCP settings with the platform URL and your API token.'
        },
        {
          heading: 'Setup for Cursor',
          content: 'Add to mcpServers section in your Cursor configuration file.'
        },
        {
          heading: 'Getting API Token',
          content: 'Go to Settings → API Tokens → Create New Token. Copy and add to MCP config as the "apiKey" field. If provided, the apiKey will be automatically sent as "Authorization: Bearer <token>" in request headers.'
        },
        {
          heading: 'Usage',
          content: 'In your AI assistant, type: "use agents-playbook and select [workflow-name]"'
        },
        {
          heading: 'Troubleshooting',
          content: 'Check token is active, URL is correct, and workflow is marked as Active.'
        }
      ]
    },
    sharing: {
      title: '🤝 Sharing & Collaboration',
      sections: [
        {
          heading: 'Visibility Settings',
          content: 'PUBLIC workflows appear in Discovery. PRIVATE workflows are user-only.'
        },
        {
          heading: 'Share Links',
          content: 'Create time-limited links (1-30 days) to share with anyone, even non-users.'
        },
        {
          heading: 'Rating System',
          content: 'Rate workflows 1-5 stars. Ratings help others discover quality content.'
        },
        {
          heading: 'Importing',
          content: 'Add any public workflow to your library. Imported workflows become your own copy.'
        }
      ]
    }
  };

  const tabs = [
    { id: 'discovery' as const, label: '🔍 Discovery', icon: '🔍' },
    { id: 'library' as const, label: '📚 Library', icon: '📚' },
    { id: 'workflows' as const, label: '🏗️ Workflows', icon: '🏗️' },
    { id: 'mcp' as const, label: '🔌 MCP', icon: '🔌' },
    { id: 'sharing' as const, label: '🤝 Sharing', icon: '🤝' }
  ];

  const currentDoc = docs[activeTab];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📖 Documentation
        </h2>
        <p className="text-gray-600">
          Quick reference guides for all platform features
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label.replace(/^.+ /, '')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{currentDoc.title}</h3>

        <div className="space-y-4">
          {currentDoc.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">•</span>
                {section.heading}
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm">
            <p className="font-medium text-yellow-900 mb-1">
              Pro Tip
            </p>
            <p className="text-yellow-800">
              You can always access this documentation from the Getting Started section in the navigation bar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
