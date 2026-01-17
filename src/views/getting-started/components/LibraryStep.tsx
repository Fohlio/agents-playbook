'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PROTECTED_ROUTES } from '@/shared/routes';

/**
 * Library Step
 *
 * Explains Library functionality
 * Shows difference between workflows and mini-prompts
 */
export function LibraryStep() {
  const t = useTranslations('gettingStarted.library');

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

      <div className="grid md:grid-cols-2 gap-4">
        {/* Workflows Card */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('workflowsTitle')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('workflowsDesc')}
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{t('workflowsFeature1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{t('workflowsFeature2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{t('workflowsFeature3')}</span>
            </li>
          </ul>
        </div>

        {/* Mini-Prompts Card */}
        <div className="bg-white border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{t('miniPromptsTitle')}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('miniPromptsDesc')}
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{t('miniPromptsFeature1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{t('miniPromptsFeature2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{t('miniPromptsFeature3')}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {t('proTip')}
            </p>
            <p className="text-xs text-gray-700">
              {t('proTipDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('manageLibrary')}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('manageLibraryDesc')}
            </p>
          </div>
          <Link
            href={PROTECTED_ROUTES.LIBRARY}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            {t('goToLibrary')}
          </Link>
        </div>
      </div>
    </div>
  );
}
