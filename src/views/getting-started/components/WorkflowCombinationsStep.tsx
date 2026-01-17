'use client';

import { useTranslations } from 'next-intl';

/**
 * Workflow Combinations Step
 *
 * Shows how to combine multiple workflows for complex projects
 * Example: PRD Creation → Feature Development
 */
export function WorkflowCombinationsStep() {
  const t = useTranslations('gettingStarted.combinations');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔗 {t('title')}
        </h2>
        <p className="text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      {/* Main Example */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>{t('exampleTitle')}</span>
        </h3>

        <div className="space-y-4">
          {/* Step 1: PRD Creation */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-600">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  {t('step1Title')}
                </h4>
                <p className="text-gray-700 mb-3">
                  {t('step1Desc')}
                </p>
                <div className="bg-purple-50 rounded p-3 mb-3">
                  <p className="text-sm font-semibold text-purple-900 mb-2">📋 {t('step1Creates')}</p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/prd.md</code> - Main PRD index</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/requirements.md</code> - Product requirements</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/design.md</code> - Technical architecture</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/design-system.md</code> - Design system specs</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/features/[feature].md</code> - Feature files with AC</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-900">
                    <span className="font-semibold">💡 {t('step1Tip')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-4xl text-gray-400">↓</div>
          </div>

          {/* Step 2: Feature Development */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  {t('step2Title')}
                </h4>
                <p className="text-gray-700 mb-3">
                  {t('step2Desc')}
                </p>
                <div className="bg-blue-50 rounded p-3 mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">🎯 {t('step2Process')}</p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Open feature file from <code className="bg-blue-100 px-1 rounded">.agents-playbook/[project]/features/[feature].md</code></li>
                    <li>• Copy the ready-to-use prompt from the feature file</li>
                    <li>• Run Feature Development workflow with that prompt</li>
                    <li>• Workflow goes through: Analysis → Design → Planning → Implementation → Testing</li>
                    <li>• References <code className="bg-blue-100 px-1 rounded">design.md</code> and <code className="bg-blue-100 px-1 rounded">design-system.md</code> for consistency</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                  <p className="text-sm text-emerald-900">
                    <span className="font-semibold">✅ {t('step2Result')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Works */}
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span>🚀</span>
          <span>{t('whyWorksTitle')}</span>
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded p-4">
            <div className="text-2xl mb-2">📐</div>
            <h5 className="font-semibold mb-2">{t('structuredPlanning')}</h5>
            <p className="text-sm text-gray-300">
              {t('structuredPlanningDesc')}
            </p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h5 className="font-semibold mb-2">{t('focusedExecution')}</h5>
            <p className="text-sm text-gray-300">
              {t('focusedExecutionDesc')}
            </p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-2xl mb-2">✨</div>
            <h5 className="font-semibold mb-2">{t('betterResults')}</h5>
            <p className="text-sm text-gray-300">
              {t('betterResultsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💪</span>
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              {t('readyToTry')}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              {t('readyToTryDesc')}
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                {t('prdCreation')}
              </span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                {t('featureDevelopment')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
