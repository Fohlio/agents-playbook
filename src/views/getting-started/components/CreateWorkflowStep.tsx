'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';

/**
 * Create Workflow Step
 *
 * Demonstrates workflow constructor
 * Shows how to build workflows visually
 */
export function CreateWorkflowStep() {
  const t = useTranslations('gettingStarted.createWorkflow');

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

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-sm">
                1
              </div>
              <h4 className="font-semibold text-gray-900">{t('step1Title')}</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              {t('step1Desc')}
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
              <h4 className="font-semibold text-gray-900">{t('step2Title')}</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              {t('step2Desc')}
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
              <h4 className="font-semibold text-gray-900">{t('step3Title')}</h4>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">{t('bestPractice')}</h4>
            <p className="text-sm text-blue-800">
              {t('bestPracticeDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">{t('contextManagement')}</h4>
            <p className="text-sm text-purple-800 mb-3">
              {t('contextManagementDesc')}
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-purple-900">{t('memoryBoard')}</strong>
                <span className="text-gray-700 ml-1">
                  {t('memoryBoardDesc')}
                </span>
              </div>
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-purple-900">{t('multiAgentChat')}</strong>
                <span className="text-gray-700 ml-1">
                  {t('multiAgentChatDesc')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="font-medium text-blue-900 mb-1">✨ {t('realTimePreview')}</p>
          <p className="text-blue-700 text-xs">{t('realTimePreviewDesc')}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="font-medium text-purple-900 mb-1">🎯 {t('smartValidation')}</p>
          <p className="text-purple-700 text-xs">{t('smartValidationDesc')}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-semibold text-violet-900 mb-2">{t('aiAssistant')}</h4>
            <p className="text-sm text-violet-800 mb-3">
              {t('aiAssistantDesc')}
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-violet-900">{t('generateWorkflows')}</strong>
                <span className="text-gray-700 ml-1">
                  {t('generateWorkflowsDesc')}
                </span>
              </div>
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-violet-900">{t('createMiniPrompts')}</strong>
                <span className="text-gray-700 ml-1">
                  {t('createMiniPromptsDesc')}
                </span>
              </div>
              <div className="bg-white rounded p-2 text-xs">
                <strong className="text-violet-900">{t('getRecommendations')}</strong>
                <span className="text-gray-700 ml-1">
                  {t('getRecommendationsDesc')}
                </span>
              </div>
            </div>
            <p className="text-xs text-violet-700 mt-3 italic">
              💡 {t('aiAssistantNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('tryConstructor')}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('tryConstructorDesc')}
            </p>
          </div>
          <Link
            href={ROUTES.LIBRARY.WORKFLOWS.NEW}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            {t('createWorkflowBtn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
